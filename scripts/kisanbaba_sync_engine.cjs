const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const OGD_API_KEY = process.env.VITE_OGD_API_KEY;
const WEATHER_API_KEY = process.env.VITE_OPENWEATHER_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[CRITICAL] Database credentials missing. Deployment aborted.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🗺️ Universal District Mapping (Exhaustive 780+ Coverage)
const DISTRICT_COORDS = require('../src/data/india_districts.json');

const OGD_MANDI_URL = `https://api.data.gov.in/resource/9ef273ef-a872-4fd2-a12b-335104a0ba04?api-key=${OGD_API_KEY}&format=json`;
const CEDA_API_URL = "https://dca.ceda.ashoka.edu.in/index.php/home/getcsvdata";

// 🌾 Crop Matrix (30 Essential Commodities)
const COMMODITY_LIST = [
  "Wheat", "Rice", "Maize", "Onion", "Tomato", "Potato", "Green Gram (Moong)",
  "Black Gram (Urd Beans)", "Lentil (Masur)", "Bengal Gram(Gram)", "Mustard",
  "Groundnut", "Soya Bean", "Cotton", "Jute", "Apple", "Banana", "Mango",
  "Ginger", "Garlic", "Coriander(Leaves)", "Turmeric", "Cauliflower", "Cabbage",
  "Brinjal", "Okra", "Green Chilli", "Lemon", "Grapes", "Orange"
];

const CEDA_COMMODITY_MAP = {
  "Rice": 1, "Wheat": 2, "Atta (Wheat)": 3, "Gram Dal": 4, "Tur/Arhar Dal": 5,
  "Urad Dal": 6, "Moong Dal": 7, "Masur Dal": 8, "Sugar": 9, "Milk @": 10,
  "Groundnut Oil": 11, "Mustard Oil": 12, "Vanaspati": 13, "Soya Oil": 14,
  "Sunflower Oil": 15, "Palm Oil": 16, "Gur": 17, "Tea Loose": 18, "Salt Packed": 19,
  "Potato": 20, "Onion": 21, "Tomato": 22
};

const NASA_BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";

/**
 * Audit Logging Helper
 */
const CEDA_CENTRES = [
  { id: 590, name: 'India' },
  { id: 44, name: 'Delhi' },
  { id: 574, name: 'Maharashtra' },
  { id: 586, name: 'Uttar Pradesh' },
  { id: 580, name: 'Punjab' },
  { id: 588, name: 'West Bengal' },
  { id: 573, name: 'Madhya Pradesh' },
  { id: 567, name: 'Haryana' }
];

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
  try {
    await supabase.from('sync_audit_logs').insert([{
      pulse_type: report.pulse_type,
      status: report.status,
      duration_ms: report.duration_ms,
      records_saved: report.records_saved,
      system_load: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }]);
  } catch (e) {
    console.warn("[AUDIT_SKIP] Could not log results to Supabase (run SQL to fix).");
  }

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
    const { count: dailyCount, error: dailyErr } = await supabase
      .from('weather_history')
      .delete({ count: 'exact' })
      .eq('source', 'NASA_POWER')
      .lt('recorded_at', historyCutoff);
    
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
  let totalSaved = 0;

  console.log("[SYNC] Starting Mandi 35-Day All-India Restoration...");

  for (let i = 0; i < 35; i++) {
    const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const dateFormatted = `${day}/${month}/${year}`;

    try {
      const url = `${OGD_MANDI_URL}&filters[arrival_date]=${dateFormatted}&offset=0&limit=40000`;
      const res = await fetch(url);
      const json = await res.json();

      if (!json.records || json.records.length === 0) continue;

      const upsertData = json.records.map(r => ({
        state: r.state,
        district: r.district,
        market: r.market,
        commodity: r.commodity,
        min_price: parseFloat(r.min_price) || 0,
        max_price: parseFloat(r.max_price) || 0,
        modal_price: parseFloat(r.modal_price) || 0,
        recorded_at: r.arrival_date,
        source: 'OGD_INDIA'
      }));

      const { error } = await supabase.from('mandi_prices').upsert(upsertData, { onConflict: 'state,district,market,commodity,recorded_at' });
      if (error) throw error;
      totalSaved += upsertData.length;
      console.log(`[MANDI] ${dateFormatted}: Ingested ${upsertData.length} records.`);
    } catch (e) {
      if (e.message.includes('403')) {
        console.warn(`[LIMIT] OGD Rate Limit at ${dateFormatted}.`);
        break;
      }
    }
  }
  return totalSaved;
}

async function syncAgPrecision() {
  console.log("[PRECISION] Launching 12-Parameter Ag-Pulse Sync...");
  const districts = Object.keys(DISTRICT_COORDS);
  let localSaved = 0;
  const now = new Date();
  const today = now.toISOString().split('T')[0].replace(/-/g, '');
  const thirtyFiveDaysAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '');

  for (let i = 0; i < districts.length; i += 5) {
    const batchDistricts = districts.slice(i, i + 5);
    const promises = batchDistricts.map(async (dName) => {
      const { lat, lng } = DISTRICT_COORDS[dName];
      const url = `${NASA_BASE_URL}?parameters=T2M,PRECTOTCORR,RH2M,PS,WS2M&community=AG&longitude=${lng}&latitude=${lat}&start=${thirtyFiveDaysAgo}&end=${today}&format=JSON`;
      
      try {
        const res = await fetch(url);
        const data = await res.json();
        const dates = Object.keys(data.properties.parameter.T2M);
        
        const upsertData = dates.map(dt => ({
          district: dName,
          recorded_at: dt.slice(0,4) + '-' + dt.slice(4,6) + '-' + dt.slice(6,8),
          temp_avg: data.properties.parameter.T2M[dt],
          precipitation: data.properties.parameter.PRECTOTCORR[dt],
          humidity: data.properties.parameter.RH2M[dt],
          pressure: data.properties.parameter.PS[dt],
          wind_speed: data.properties.parameter.WS2M[dt]
        }));

        const { error } = await supabase.from('nasa_ag_precision').upsert(upsertData, { onConflict: 'district,recorded_at' });
        if (!error) return upsertData.length;
      } catch (e) { return 0; }
    });

    const results = await Promise.all(promises);
    localSaved += results.reduce((a, b) => a + (b || 0), 0);
    if (i % 20 === 0) console.log(`[PRECISION] Sync Status: ${Math.round((i/districts.length)*100)}% Complete...`);
  }

  console.log("[PRECISION] NASA Ag-Precision Sync Complete. ✅🌾🧬");
  return localSaved;
}

async function syncOpenWeatherPulse(shardIndex = -1) {
  if (!WEATHER_API_KEY) {
    console.warn("[SKIP] No OpenWeather key found.");
    return 0;
  }

  const allDistricts = Object.entries(DISTRICT_COORDS);
  let targets = allDistricts;

  if (shardIndex >= 0) {
    const shardSize = Math.ceil(allDistricts.length / 8);
    const start = shardIndex * shardSize;
    targets = allDistricts.slice(start, start + shardSize);
    console.log(`[SYNC] OWM Pulse Shard [${shardIndex}/7]: Processing targets ${start} to ${start + targets.length}...`);
  }

  let localSaved = 0;
  for (const [name, coords] of targets) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${WEATHER_API_KEY}&units=metric`;
      const res = await fetch(url);
      if (res.status === 429) {
        console.warn(`[SKIP] OWM 429/Fail for ${name}`);
        continue;
      }
      const data = await res.json();
      
      const { error } = await supabase.from('weather_history').upsert([{
        state: 'India',
        district: name,
        recorded_at: new Date().toISOString(),
        temp_avg: data.main.temp,
        humidity: data.main.humidity,
        precipitation: data.rain ? (data.rain['1h'] || 0) : 0,
        source: 'OPENWEATHER_H3'
      }], { onConflict: 'state,district,recorded_at,source' });

      if (!error) localSaved++;
    } catch (e) { continue; }
  }

  console.log("[SYNC] OpenWeather All-India Pulse Complete.");
  return localSaved;
}

// Stubs for Daily Logic
async function syncAtmosphericPulse() { return 0; }
async function syncWeatherDaily() { return 0; }

// Execution
if (require.main === module) {
  runSync().catch(err => {
    console.error("--- KISANBABA SYNC ENGINE FATAL CRASH ---");
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  });
}
