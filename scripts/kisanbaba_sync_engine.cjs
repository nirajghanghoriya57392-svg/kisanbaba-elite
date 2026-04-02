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

// Top 30 Essential Crops for India (90% Production Volume + High-Value Diversification)
const TOP_30_COMMODITIES = [
  "Paddy (Dhan)", "Wheat", "Sugarcane", "Maize", "Potato", "Onion", "Tomato",
  "Soybean", "Mustard", "Cotton", "Banana", "Mango", "Groundnut", "Gram (Chana)",
  "Arhar (Tur)", "Bajra (Pearl Millet)", "Jowar (Sorghum)", "Coconut",
  "Ginger", "Turmeric", "Green Chilli", "Brinjal", "Cabbage", "Cauliflower",
  "Okra (Bhindi)", "Apple", "Garlic", "Coriander", "Cumin (Jeera)", "Moong"
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

// Prepare District Mapping for Weather (from india_districts.json)
const RAW_DISTRICTS = JSON.parse(fs.readFileSync(DISTRICTS_PATH, 'utf-8'));
const DISTRICT_COORDS = Object.entries(RAW_DISTRICTS).reduce((acc, [state, dists]) => {
  dists.forEach(d => {
    acc[d.district] = { 
      lat: d.lat, 
      lon: d.lng, // Mapping lng to lon for NASA API compatibility
      state 
    };
  });
  return acc;
}, {});


/**
 * Main Run Function
 */
async function runSync() {
  const args = process.argv.slice(2);
  const mode = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'full';
  const isDailySlot = mode === 'daily' || mode === 'full';

  console.log(`--- KISANPULSE SYNC ENGINE [MODE: ${mode.toUpperCase()}] ---`);
  const startTime = Date.now();
  let totalSaved = 0;
  const now = new Date();
  
  // 40-Day Retention Buffer (Ensures 35-day window is always solid)
  const historyCutoff = new Date(now.getTime() - (40 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  const pulseCutoff = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString();
  
  if (isDailySlot) {
    console.log(`[PURGE] Starting Daily Maintenance (35d history)...`);
    await purgeOldData(historyCutoff, pulseCutoff);

    console.log("[SYNC] Starting Agri-Mandi Price Sync (30 Crops / 780+ Districts)...");
    totalSaved += await syncMandiData() || 0;

    console.log("[SYNC] Starting CEDA Retail Price Sync...");
    totalSaved += await syncCedaRetailPrices() || 0;
  }

  try {
    // 🧬 NASA Ag-Precision (Every Pulse - 35-Day Window)
    totalSaved += await syncAgPrecision() || 0;
    
    // ⛈️ OpenWeather (Sharded Every Pulse - 1k Limit)
    const shardIndex = isDailySlot ? -1 : Math.floor(now.getUTCHours() / 3);
    totalSaved += await syncOpenWeatherPulse(shardIndex) || 0;

    if (isDailySlot) {
      totalSaved += await syncAtmosphericPulse() || 0;
      totalSaved += await syncWeatherDaily() || 0;
    }
  } catch (e) {
    console.error("[FATAL] Weather Sync Logic Error:", e.message);
  }

  const durationMs = Date.now() - startTime;
  console.log(`--- KISANBABA SYNC ENGINE COMPLETE ---`);
  console.log(`[AUDIT] Total records saved: ${totalSaved} | Duration: ${durationMs}ms`);

  const report = {
    status: 'SUCCESS',
    records_saved: totalSaved,
    duration_ms: durationMs,
    pulse_type: process.env.GITHUB_ACTIONS === 'true' ? 'GITHUB_ACTION' : 'MANUAL'
  };

  // 📝 Autonomous Audit Report
  await supabase.from('sync_audit_logs').insert([{
    pulse_type: report.pulse_type,
    status: report.status,
    duration_ms: report.duration_ms,
    records_saved: report.records_saved,
    system_load: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
  }]).catch(e => console.warn("[AUDIT_SKIP] Could not log results to Supabase (run SQL to fix)."));

  return report;
}

async function purgeOldData(historyCutoff, pulseCutoff) {
  // Purge Generic History (35 Days)
  const historyConfigs = [
    { table: 'mandi_prices', col: 'recorded_at', cutoff: historyCutoff },
    { table: 'retail_prices', col: 'recorded_at', cutoff: historyCutoff }
  ];

  for (const conf of historyConfigs) {
    try {
      const { count, error } = await supabase.from(conf.table).delete({ count: 'exact' }).lt(conf.col, conf.cutoff);
      if (error) throw error;
      console.log(`[PURGE] ${conf.table}: Removed ${count || 0} historical records (>35 days).`);
    } catch (e) {
      console.warn(`[PURGE] ${conf.table} error:`, e.message);
    }
  }

  // Purge Weather History based on Resolution (Daily vs Hourly)
  try {
    // 1. Purge Daily Weather Legacy (>35 Days)
    const { count: dailyCount, error: dailyErr } = await supabase
      .from('weather_history')
      .delete({ count: 'exact' })
      .eq('source', 'NASA_POWER')
      .lt('recorded_at', historyCutoff);
    
    // 2. Purge Hourly Pulse legacy (>7 Days)
    const { count: hourlyCount, error: hourlyErr } = await supabase
      .from('weather_history')
      .delete({ count: 'exact' })
      .in('source', ['NASA_HOURLY_PULSE', 'OPENWEATHER_H3', 'NASA_POWER'])
      .lt('recorded_at', pulseCutoff);

    if (dailyErr || hourlyErr) throw (dailyErr || hourlyErr);
    console.log(`[PURGE] Weather History: Cleaned ${dailyCount || 0} daily history & ${hourlyCount || 0} precision pulse records.`);
  } catch (e) {
    console.warn("[PURGE] Weather error:", e.message);
  }
}

async function syncCedaRetailPrices() {
  const commodities = Object.entries(CEDA_COMMODITY_MAP);
  const today = new Date().toISOString().split('T')[0];
  let localSaved = 0;

  for (const [name, id] of commodities) {
    try {
      // Fetch 35 days to ensure full 2026 intelligence window (CEDA National Benchmarks)
      const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const res = await fetch(CEDA_API_URL, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `commodity=${id}&centre=0&zone=0&mode=1&type=1&from=${thirtyFiveDaysAgo}&to=${today}`
      });

      const data = await res.json();
      if (!data.date || data.date.length === 0) continue;

      // Write all historical points within the 35-day window
      const upsertData = data.date.map((d, i) => ({
        state: 'India',
        commodity: name,
        retail_price: parseFloat(data.price[i]),
        recorded_at: d,
        source: 'CEDA_ASHOKA'
      }));

      const { error } = await supabase
        .from('retail_prices')
        .upsert(upsertData, { onConflict: 'state,commodity,recorded_at' });

      if (error) console.error(`[ERROR] CEDA Sync Fail for ${name}:`, error.message);
      else localSaved += upsertData.length;
    } catch (e) {
      console.warn(`[WARN] CEDA sync failed for ${name}: ${e.message}`);
    }
  }
  return localSaved;
}

async function syncMandiData() {
  const now = new Date();
  const limit = 1000;
  let totalSaved = 0;

  console.log("[SYNC] Starting Mandi 35-Day All-India Restoration...");

  for (let i = 0; i < 35; i++) {
    const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const dateFormatted = `${day}/${month}/${year}`;

    try {
      console.log(`[PULSE] [${i+1}/35] Syncing All-India Market Data for: ${dateFormatted}...`);

      let offset = 0;
      let hasMoreInDay = true;
      let daySaved = 0;

      let dateRetryCount = 0;
      // High-Tolerance Offset to capture 780+ districts x 30 crops (expected ~23k records/day)
      while (hasMoreInDay && offset < 40000) { 
        const url = `https://api.data.gov.in/resource/${MANDI_RESOURCE_ID}?api-key=${OGD_API_KEY}&format=json&limit=${limit}&offset=${offset}&filters[arrival_date]=${dateFormatted}`;
        
        let res;
        try {
          res = await fetch(url);
        } catch (fetchErr) {
          console.error(`[CRITICAL] Network error for ${dateFormatted}:`, fetchErr.message);
          break;
        }

        if (!res || res.status === 429) {
          dateRetryCount++;
          if (dateRetryCount > 3) {
            console.error(`[SKIP] Excessive 429s for date ${dateFormatted}. Moving to next date...`);
            break; 
          }
          console.warn(`[RETRY] Rate limited (429) [${dateRetryCount}/3] for ${dateFormatted}. Sleeping 30s...`);
          await new Promise(r => setTimeout(r, 30000));
          continue; 
        }

        if (!res.ok) {
           console.warn(`[SKIP] HTTP ${res.status} for date ${dateFormatted}`);
           break;
        }

        const data = await res.json();
        const rawRecords = data.records || [];

        if (rawRecords.length === 0) {
          hasMoreInDay = false;
          break;
        }

        const filtered = rawRecords.filter(r => 
          TOP_30_COMMODITIES.some(c => (r.commodity || '').toLowerCase().includes(c.toLowerCase()))
        );

        if (filtered.length > 0) {
          const upsertMap = new Map();
          filtered.forEach(r => {
            const arrDate = formatDate(r.arrival_date);
            const key = `${r.state}|${r.district}|${r.market}|${r.commodity}|${r.variety}|${arrDate}`;
            upsertMap.set(key, {
              state: r.state,
              district: r.district,
              market: r.market,
              commodity: r.commodity,
              variety: r.variety || 'Default',
              grade: r.grade || 'FAQ',
              recorded_at: arrDate,
              arrival_quantity: null,
              min_price: parseFloat(r.min_price || 0),
              max_price: parseFloat(r.max_price || 0),
              modal_price: parseFloat(r.modal_price || 0),
              source: 'OGD_INDIA'
            });
          });

          const { error } = await supabase.from('mandi_prices').upsert(Array.from(upsertMap.values()), {
            onConflict: 'state,district,market,commodity,variety,recorded_at'
          });

          if (error) console.error(`[ERROR] Batch Upsert Error for ${dateFormatted}:`, error.message);
          else {
            daySaved += filtered.length;
            totalSaved += filtered.length;
            console.log(`[PULSE] Ingested ${daySaved} records for ${dateFormatted} (Cumulative All-India: ${totalSaved})...`);
          }
        }

        offset += limit;
        if (rawRecords.length < limit) hasMoreInDay = false;
        await new Promise(r => setTimeout(r, 2000)); // Adaptive Throttle
      }
      console.log(`[SUCCESS] Completed Date [${i+1}/35]: ${dateFormatted} -> Total Ingested: ${daySaved}`);
    } catch (dateE) {
      console.error(`[FATAL] Fatal Date Failure for ${dateFormatted}:`, dateE.message);
    }
  }
  console.log(`[SYNC] Mandi Restoration Complete for all 765 Districts. Total salvaged: ${totalSaved}`);
  return totalSaved;
}

async function syncWeatherDaily() {
  const districts = Object.entries(DISTRICT_COORDS);
  const now = new Date();
  const startDate = new Date(now.getTime() - (35 * 24 * 60 * 60 * 1000));
  let localSaved = 0;

  const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
  const endStr = now.toISOString().split('T')[0].replace(/-/g, '');

  console.log(`[SYNC] Daily Weather History: Processing 35-day window for all districts...`);

  for (let i = 0; i < districts.length; i++) {
    const [name, coords] = districts[i];
    try {
      if (!coords || isNaN(coords.lat) || isNaN(coords.lon)) {
        console.warn(`[SKIP] Invalid coordinates for ${name}`);
        continue;
      }

      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?start=${startStr}&end=${endStr}&latitude=${coords.lat}&longitude=${coords.lon}&community=AG&parameters=T2M_MAX,T2M_MIN,RH2M,PRECTOTCORR,WS2M&format=JSON`;
      
      const res = await fetch(url);
      if (!res || !res.ok) {
        console.warn(`[SKIP] NASA Daily ${res?.status || 'FAIL'} for ${name}`);
        continue;
      }

      const data = await res.json();
      if (!data.properties?.parameter) continue;

      const p = data.properties.parameter;
      const dates = Object.keys(p.T2M_MAX);
      
      const upsertPayload = dates.map(dateStr => {
        const timestamp = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}T00:00:00Z`;
        return {
          state: coords.state,
          district: name,
          recorded_at: timestamp,
          temp_max: p.T2M_MAX[dateStr],
          temp_min: p.T2M_MIN[dateStr],
          humidity: p.RH2M[dateStr],
          wind_speed: p.WS2M[dateStr],
          solar_rad: 0,
          condition: p.PRECTOTCORR[dateStr] > 0 ? 'Rain' : 'Clear',
          rain_prob: p.PRECTOTCORR[dateStr],
          source: 'NASA_POWER'
        };
      });

      const { error } = await supabase.from('weather_history').upsert(upsertPayload, { onConflict: 'state,district,recorded_at,source' });
      if (error) console.error(`[ERROR] NASA Sync fail for ${name}: ${error.message}`);
      else localSaved += upsertPayload.length;
      
      if (i % 50 === 0) console.log(`[SYNC] Daily Weather Status: ${Math.round((i/districts.length)*100)}% Complete...`);
      await new Promise(r => setTimeout(r, 200)); // Throttling
    } catch (e) {
      console.warn(`[WARN] Daily weather fail for ${name}`);
    }
  }
  return localSaved;
}

/**
 * syncAtmosphericPulse: All-India 3-Hourly Restoration (7-Day Window)
 * Powered by NASA POWER Hourly API for Unlimited High-Fidelity Data
 */
async function syncAtmosphericPulse() {
  const districts = Object.entries(DISTRICT_COORDS);
  const now = new Date();
  const startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  let localSaved = 0;

  const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
  const endStr = now.toISOString().split('T')[0].replace(/-/g, '');

  console.log(`[SYNC] Atmospheric Restoration: Initializing 7-day 3-hourly pulse for ${districts.length} districts...`);

  let batch = [];
  const BATCH_SIZE = 40; // Optimize for Supabase performance

  for (let i = 0; i < districts.length; i++) {
    const [name, coords] = districts[i];
    try {
      if (!coords || isNaN(coords.lat) || isNaN(coords.lon)) {
        continue;
      }

      const url = `https://power.larc.nasa.gov/api/temporal/hourly/point?start=${startStr}&end=${endStr}&latitude=${coords.lat}&longitude=${coords.lon}&community=AG&parameters=T2M,RH2M,PRECTOTCORR,WS2M&format=JSON`;

      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[SKIP] NASA Pulse failed for ${name} (HTTP ${res.status})`);
        continue;
      }

      const data = await res.json();
      if (!data.properties?.parameter) continue;

      const p = data.properties.parameter;
      const hours = Object.keys(p.T2M);

      // Filter for 3-hourly pulse points (0, 3, 6, 9, 12, 15, 18, 21)
      hours.forEach((hourKey) => {
        const hour = parseInt(hourKey.substring(8, 10));
        if (hour % 3 === 0) {
          const y = hourKey.substring(0, 4);
          const m = hourKey.substring(4, 6);
          const d = hourKey.substring(6, 8);
          const timestamp = `${y}-${m}-${d}T${hourKey.substring(8, 10)}:00:00Z`;

          batch.push({
            state: coords.state,
            district: name,
            recorded_at: timestamp,
            temp_max: p.T2M[hourKey],
            temp_min: p.T2M[hourKey], // Hourly is point-in-time
            humidity: p.RH2M[hourKey],
            wind_speed: p.WS2M[hourKey],
            solar_rad: 0,
            condition: p.PRECTOTCORR[hourKey] > 0 ? 'Rain' : 'Clear',
            rain_prob: p.PRECTOTCORR[hourKey],
            source: 'NASA_POWER'
          });
        }
      });

      // Periodic Upsert to prevent memory bloat
      if (batch.length >= BATCH_SIZE * 8) {
        const { error } = await supabase.from('weather_history').upsert(batch, {
          onConflict: 'state,district,recorded_at,source'
        });
        if (error) console.error(`[ERROR] Pulse Batch Fail:`, error.message);
        else localSaved += batch.length;
        
        console.log(`[SYNC] Pulse Status: ${Math.round(((i + 1) / districts.length) * 100)}% Complete...`);
        batch = [];
        await new Promise(r => setTimeout(r, 1000)); // Rate limit protection
      }

    } catch (e) {
      console.warn(`[WARN] Atmospheric exception for ${name}:`, e.message);
    }
  }

  // Final flush
  if (batch.length > 0) {
    const { error } = await supabase.from('weather_history').upsert(batch, { onConflict: 'state,district,recorded_at,source' });
    if (!error) localSaved += batch.length;
  }

  console.log(`[SYNC] NASA Atmospheric Pulse Complete.`);
  return localSaved;
}

/**
 * syncOpenWeatherPulse: 3-Hourly Forecast Alignment with Strategic Sharding
 * shardIndex: -1 (all), or 0-7 for tactical subsets
 */
async function syncOpenWeatherPulse(shardIndex = -1) {
  if (!WEATHER_API_KEY) {
    console.warn("[SKIP] No OpenWeather key found.");
    return 0;
  }

  const allDistricts = Object.entries(DISTRICT_COORDS);
  let targets = allDistricts;

  // 🧬 Shard Logic: If pulse mode, process 1/8th of the list
  if (shardIndex >= 0) {
    const shardSize = Math.ceil(allDistricts.length / 8);
    const start = shardIndex * shardSize;
    targets = allDistricts.slice(start, start + shardSize);
    console.log(`[SYNC] OWM Pulse Shard [${shardIndex}/7]: Processing targets ${start} to ${start + targets.length}...`);
  } else {
    console.log(`[SYNC] OpenWeather Pulse: Processing all ${allDistricts.length} districts (Daily Mega Pulse)...`);
  }

  let localSaved = 0;

  for (let i = 0; i < targets.length; i++) {
    const [name, coords] = targets[i];
    try {
      // ⛈️ OWM 5-Day / 3-Hourly Forecast - Using API Key (VITE_OPENWEATHER_API_KEY)
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${process.env.VITE_OPENWEATHER_API_KEY}&units=metric`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[SKIP] OWM 429/Fail for ${name}`);
        continue;
      }

      const data = await res.json();
      if (!data.list) continue;

      const upsertPayload = data.list.map(item => ({
        state: coords.state,
        district: name,
        recorded_at: new Date(item.dt * 1000).toISOString(),
        temp_max: item.main.temp_max,
        temp_min: item.main.temp_min,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        solar_rad: 0,
        condition: item.weather[0].main,
        rain_prob: item.pop || 0,
        source: 'OPENWEATHER_H3'
      }));

      const { error } = await supabase.from('weather_history').upsert(upsertPayload, { onConflict: 'state,district,recorded_at,source' });
      if (error) console.error(`[ERROR] OWM Sync for ${name}: ${error.message}`);
      else localSaved += upsertPayload.length;
      
      if (i % 50 === 0) console.log(`[SYNC] OWM Pulse Status: ${Math.round((i/districts.length)*100)}% Complete...`);
    } catch (e) {
      console.warn(`[WARN] OWM pulse fail for ${name}`);
    }
  }
  console.log("[SYNC] OpenWeather All-India Pulse Complete.");
  return localSaved;
}

/**
 * syncAgPrecision: High-Fidelity 12-Parameter Agricultural Integrated Shield
 * Mission: 35-Day tactical history for Soil Moisture, Heat Waves, and Frost Risk.
 */
async function syncAgPrecision() {
  const districts = Object.entries(DISTRICT_COORDS);
  const now = new Date();
  const startDate = new Date(now.getTime() - (35 * 24 * 60 * 60 * 1000));
  let localSaved = 0;

  const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
  const endStr = now.toISOString().split('T')[0].replace(/-/g, '');

  console.log(`[PRECISION] Launching 12-Parameter Ag-Pulse Sync...`);

  for (let i = 0; i < districts.length; i++) {
    const [name, coords] = districts[i];
    try {
      if (!coords || isNaN(coords.lat) || isNaN(coords.lon)) continue;

      // Parameters: Max/Min Temp, Humidity, Precip, Soil Moisture (Root), Evapotranspiration, Solar, Wind
      const params = 'T2M_MAX,T2M_MIN,RH2M,PRECTOTCORR,GWETPROF,EVLAND,ALLSKY_SFC_SW_DWN,WS2M';
      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?start=${startStr}&end=${endStr}&latitude=${coords.lat}&longitude=${coords.lon}&community=AG&parameters=${params}&format=JSON`;
      
      const res = await fetch(url);
      if (!res || !res.ok) continue;

      const data = await res.json();
      if (!data.properties?.parameter) continue;

      const p = data.properties.parameter;
      const dates = Object.keys(p.T2M_MAX);
      
      const upsertPayload = dates.map(dateStr => {
        const timestamp = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}T00:00:00Z`;
        const tMax = p.T2M_MAX[dateStr];
        const tMin = p.T2M_MIN[dateStr];
        const tAvg = (tMax + tMin) / 2;
        
        // Tactical Derivations
        let heatWave = 'NORMAL';
        if (tMax > 45) heatWave = 'SEVERE';
        else if (tMax > 40) heatWave = 'WARN';

        let frostRisk = 'SAFE';
        if (tMin < 2) frostRisk = 'CRITICAL';
        else if (tMin < 4) frostRisk = 'MILD';

        const gdd = Math.max(0, tAvg - 10); // Base 10 standard

        return {
          state: coords.state,
          district: name,
          recorded_at: timestamp,
          temp_max: tMax,
          temp_min: tMin,
          temp_avg: tAvg,
          humidity: p.RH2M[dateStr],
          precipitation: p.PRECTOTCORR[dateStr],
          wind_speed: p.WS2M[dateStr],
          solar_irradiance: p.ALLSKY_SFC_SW_DWN[dateStr],
          soil_moisture: p.GWETPROF[dateStr],
          evapotranspiration: p.EVLAND[dateStr],
          heat_wave_index: heatWave,
          frost_risk_level: frostRisk,
          gdd_cumulative: gdd,
          source: 'NASA_POWER_PRECISION'
        };
      });

      const { error } = await supabase.from('nasa_ag_precision').upsert(upsertPayload, { 
        onConflict: 'state,district,recorded_at,source' 
      });

      if (error && error.code !== '42P01') { // 42P01 is "table does not exist" - expected if user hasn't run the SQL yet
        console.error(`[PRECISION] Sync Fail for ${name}:`, error.message);
      } else if (!error) {
        localSaved += upsertPayload.length;
      }
      
      if (i % 50 === 0) console.log(`[PRECISION] Sync Status: ${Math.round((i/districts.length)*100)}% Complete...`);
      await new Promise(r => setTimeout(r, 100)); // Throttling
    } catch (e) {
      console.warn(`[WARN] Precision sync fail for ${name}`);
    }
  }
  console.log("[PRECISION] NASA Ag-Precision Sync Complete. ✅🌾🧬");
  return localSaved;
}

module.exports = {
  runSync,
  syncWeatherDaily,
  syncAtmosphericPulse,
  syncOpenWeatherPulse,
  syncAgPrecision
};

function formatDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date().toISOString().split('T')[0];
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts[0].length === 4) return dateStr.replace(/\//g, '-');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('--- UNHANDLED REJECTION ---');
  console.error(reason);
});

process.on('uncaughtException', (err) => {
  console.error('--- UNCAUGHT EXCEPTION ---');
  console.error(err);
  process.exit(1);
});

if (require.main === module) {
  runSync().catch(e => {
    console.error("--- KISANBABA SYNC ENGINE FATAL CRASH ---");
    console.error(e.message);
    console.error(e.stack);
    process.exit(1);
  });
}
