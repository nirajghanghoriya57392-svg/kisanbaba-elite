/**
 * KisanBaba Data Sync Engine v1.0
 * Fully Automated & Autonomous Data Pipeline
 * Handles: Mandi Prices, Weather History, Retail Prices
 * Logic: 60-Day Rolling Window (Collect Latest, Purge Old)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY; 
const OGD_API_KEY = process.env.VITE_OGD_API_KEY;
const WEATHER_API_KEY = process.env.VITE_OPENWEATHER_API_KEY;
const CEDA_HEADERS = {
  'Referer': 'https://dca.ceda.ashoka.edu.in/index.php/home/download',
  'Cookie': '_ga=GA1.1.1444427093.1774138704; _ga_9W06N0B2DB=GS2.1.s1774987302$o8$g1$t1774989251$j60$l0$h0',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
};

if (!SUPABASE_URL || !SUPABASE_KEY || !OGD_API_KEY) {
  console.error("CRITICAL: Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TEST_MODE = process.env.KISANBABA_TEST === 'true';
const HI_PRECISION = process.env.KISANBABA_PRECISION === 'high';

// Robust Fetch Check
if (typeof fetch === 'undefined') {
  console.error("CRITICAL: Global 'fetch' not found. This Node version may be too old or configured incorrectly.");
  process.exit(1);
}

// Data Sources
const MANDI_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const DISTRICTS_PATH = path.join(__dirname, '../src/data/india_districts.json');

// Top 30 Critical Commodities for India (High Volume & Value)
const TOP_30_COMMODITIES = [
  "Tomato", "Onion", "Potato", "Paddy (Dhan)", "Rice", "Wheat", "Soyabean", 
  "Maize", "Garlic", "Green Chilli", "Brinjal", "Cabbage", "Cauliflower", 
  "Okra (Bhindi)", "Banana", "Mango", "Cotton", "Sugarcane", "Mustard", 
  "Groundnut", "Turmeric", "Coriander", "Gram (Chana)", "Arhar (Tur)", 
  "Moong (Green Gram)", "Urad (Black Gram)", "Masur Dal", "Apple", 
  "Pomegranate", "Ginger"
];

// CEDA Mapping (Commodity -> ID)
const CEDA_COMMODITY_MAP = {
  "Rice": 3, "Wheat": 2, "Atta": 4, "Gram Dal": 5, "Tur/Arhar Dal": 6, 
  "Urad Dal": 7, "Moong Dal": 8, "Masoor Dal": 9, "Sugar": 10, "Milk": 11,
  "Groundnut Oil": 12, "Mustard Oil": 13, "Vanaspati": 14, "Soya Oil": 15, 
  "Sunflower Oil": 16, "Palm Oil": 17, "Potato": 18, "Onion": 19, "Tomato": 20, 
  "Garlic": 21, "Ginger": 22
};

const CEDA_API_URL = 'https://dca.ceda.ashoka.edu.in/index.php/home/getgraph';

/**
 * Throttled fetch for OpenWeather
 */
async function throttledFetch(url, delay = 1000) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return fetch(url);
}


/**
 * Main Run Function
 */
async function runSync() {
  console.log(`--- KISANBABA SYNC ENGINE STARTING (${HI_PRECISION ? 'HIGH PRECISION' : 'STANDARD'}) ---`);
  const now = new Date();
  const utcHour = now.getUTCHours();

  // We only run the Heavy/Deep Sync (Mandi + CEDA) once a day to save API credits and avoid redundant scans.
  // Window: 14:00 - 15:00 UTC (Approx 7:30 PM - 8:30 PM IST)
  const isMainSyncWindow = (utcHour >= 14 && utcHour <= 15);

  // 35-Day Rolling Window for Free Tier Sustainability
  const cutoffDate = new Date(now.getTime() - (35 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  
  if (isMainSyncWindow || !HI_PRECISION) {
    console.log(`[PURGE] Starting 35-day data maintenance (Cutoff: ${cutoffDate})...`);
    await purgeOldData(cutoffDate);

    console.log("[SYNC] Starting Mandi Price Sync (Top 30 Crops Only)...");
    await syncMandiData();

    console.log("[SYNC] Starting CEDA Retail Price Sync...");
    await syncCedaRetailPrices();
  } else {
    console.log("[SKIP] Main Data Sync (Mandi/CEDA) already complete for today. Skipping to High-Precision Weather...");
  }

  console.log("[SYNC] Starting Weather History Sync (700+ Districts)...");
  await syncWeatherHistory();

  console.log("--- KISANBABA SYNC ENGINE COMPLETE ---");
}

async function purgeOldData(cutoff) {
  const configs = [
    { table: 'mandi_prices', col: 'recorded_at' },
    { table: 'retail_prices', col: 'recorded_at' },
    { table: 'weather_history', col: 'recorded_at' }
  ];

  for (const conf of configs) {
    console.log(`[PURGE] Starting batch purge for ${conf.table}...`);
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const { count, error } = await supabase
          .from(conf.table)
          .delete({ count: 'exact' })
          .lt(conf.col, cutoff)
          .limit(5000); // Small batches to avoid timeouts
        
        if (error) {
          console.error(`[PURGE] ${conf.table} error:`, error.message);
          hasMore = false;
        } else {
          totalDeleted += (count || 0);
          if (!count || count < 5000) hasMore = false;
          console.log(`[PURGE] ${conf.table}: Deleted ${totalDeleted} records so far...`);
          // Brief pause to allow the DB to breathe
          await new Promise(r => setTimeout(r, 500));
        }
      } catch (e) {
        console.warn(`[PURGE] ${conf.table} exception:`, e.message);
        hasMore = false;
      }
    }
  }
}

async function syncCedaRetailPrices() {
  const commodities = Object.entries(CEDA_COMMODITY_MAP);
  const today = new Date().toISOString().split('T')[0];

  for (const [name, id] of commodities) {
    try {
      // Fetch 7 days to ensure we have the most recent data point (CEDA sometimes lagging by 1-2 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const res = await fetch(CEDA_API_URL, {
        method: 'POST',
        headers: { 
          ...CEDA_HEADERS,
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: `commodity=${id}&centre=0&zone=0&mode=1&type=1&from=${sevenDaysAgo}&to=${today}`
      });

      const data = await res.json();
      if (!data.date || data.date.length === 0) continue;

      // Extract the latest price point (Daily average India level)
      const latestPrice = parseFloat(data.price[data.price.length - 1]);
      const latestDate = data.date[data.date.length - 1];

      console.log(`[SYNC] CEDA: ${name} @ ₹${latestPrice}/kg (${latestDate})`);

      // Write to the retail_prices source table
      const { error } = await supabase
        .from('retail_prices')
        .upsert({ 
          state: 'India', // CEDA National data
          commodity: name,
          retail_price: latestPrice,
          recorded_at: latestDate,
          source: 'CEDA_ASHOKA'
        }, { onConflict: 'state,commodity,recorded_at' });

      if (error) console.error(`[ERROR] CEDA Sync Fail for ${name}:`, error.message);
    } catch (e) {
       console.warn(`[WARN] CEDA sync failed for ${name}: ${e.message}`);
    }
  }
}

async function syncMandiData() {
  let offset = 0;
  const limit = 1000;
  let hasMore = true;
  let totalSaved = 0;

  // Scan up to 50k records to ensure we find our Top 30 commodities across 3,000+ mandis
  const MAX_OFFSET = TEST_MODE ? 1000 : 50000;
  while (hasMore && offset < MAX_OFFSET) { 
    try {
      const url = `https://api.data.gov.in/resource/${MANDI_RESOURCE_ID}?api-key=${OGD_API_KEY}&format=json&limit=${limit}&offset=${offset}`;
      const res = await fetch(url);
      const data = await res.json();
      const rawRecords = data.records || [];

      if (rawRecords.length === 0) {
        hasMore = false;
        break;
      }

      // Filter for Top 30 Commodities only
      const records = rawRecords.filter(r => 
        TOP_30_COMMODITIES.some(c => r.commodity?.toLowerCase().includes(c.toLowerCase()))
      );

      if (records.length === 0) {
        offset += limit;
        continue;
      }

      // Map to Supabase Schema
      const upsertData = records.map(r => ({
        state: r.state,
        district: r.district,
        market: r.market,
        commodity: r.commodity,
        variety: r.variety,
        grade: r.grade,
        arrival_date: formatDate(r.arrival_date), // This is the API field
        recorded_at: formatDate(r.arrival_date),  // This is the DB column
        min_price: parseFloat(r.min_price || 0),
        max_price: parseFloat(r.max_price || 0),
        modal_price: parseFloat(r.modal_price || 0),
        source: 'OGD_INDIA'
      }));

      const { error } = await supabase.from('mandi_prices').upsert(upsertData, {
        onConflict: 'state,district,market,commodity,variety,recorded_at'
      });

      if (error) console.error(`[ERROR] Mandi Upsert at offset ${offset}:`, error.message);
      else {
        totalSaved += records.length;
        console.log(`[SYNC] Mandi: ${totalSaved} records processed...`);
      }

      offset += limit;
      if (records.length < limit) hasMore = false;
    } catch (e) {
      console.error(`[ERROR] Mandi Sync Error:`, e);
      hasMore = false;
    }
  }
}

async function syncWeatherHistory() {
  const p = path.resolve(__dirname, '..', 'src', 'data', 'india_districts.json');
  if (!fs.existsSync(p)) return console.error(`[ERROR] Districts file not found`);

  const districtData = JSON.parse(fs.readFileSync(p, 'utf-8'));
  let allDistricts = [];
  for (const state in districtData) {
    if (districtData[state] && Array.isArray(districtData[state])) {
       districtData[state].forEach(d => allDistricts.push({ state, ...d }));
    }
  }

  if (TEST_MODE) allDistricts = allDistricts.slice(0, 5);
  console.log(`[SYNC] Weather: Processing ${allDistricts.length} districts...`);
  
  for (const d of allDistricts) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${d.lat}&lon=${d.lng}&appid=${WEATHER_API_KEY}&units=metric`;
      const res = await throttledFetch(url, 200);
      const data = await res.json();
      
      if (data.main) {
        // High Precision: Store resolution in hours (YYYY-MM-DD HH:00:00)
        // This allows us to see the "Peak Heat" vs "Night Cool"
        const recordedAt = HI_PRECISION 
          ? new Date().toISOString().replace('T', ' ').substring(0, 13) + ':00:00'
          : new Date().toISOString().split('T')[0];

        await supabase.from('weather_history').upsert({
          state: d.state,
          district: d.district,
          recorded_at: recordedAt,
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          condition: data.weather[0].main,
          rain_prob: data.clouds ? data.clouds.all : 0
        }, { onConflict: 'state,district,recorded_at' });
      }
    } catch (e) {
      console.warn(`[WARN] Weather fail for ${d.district}: ${e.message}`);
    }
  }
}

function formatDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date().toISOString().split('T')[0];
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts[0].length === 4) return dateStr.replace(/\//g, '-');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
}

runSync().catch(e => {
  console.error("--- KISANBABA SYNC ENGINE CRASHED ---");
  console.error(e);
  console.error(JSON.stringify(e, Object.getOwnPropertyNames(e)));
  process.exit(1);
});
