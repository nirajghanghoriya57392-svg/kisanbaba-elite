/**
 * KisanPulse Autonomous Heartbeat v1.0
 * The "Always-On" Watchdog for Local & Cloud Autonomy
 * Roles: Scheduling, Self-Healing, and Audit Logging
 */

const { runSync } = require('./kisanbaba_sync_engine.cjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PULSE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 Hours
const RETRY_DELAY_MS = 15 * 60 * 1000;      // 15 Minutes on fail

async function pulse() {
  console.log(`\n[HEARTBEAT] Starting Autonomous Pulse: ${new Date().toISOString()}`);
  
  try {
    const result = await runSync();
    
    // Log to Supabase Audit
    const { error } = await supabase.from('sync_audit_logs').insert([{
      pulse_type: 'HEARTBEAT',
      status: result.status,
      duration_ms: result.duration_ms,
      records_saved: result.records_saved,
      system_load: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }]);

    if (error) {
      console.error(`[AUDIT_FAIL] Could not write to sync_audit_logs:`, error.message);
      console.log("Tip: Ensure you have run the SQL to create the table.");
    } else {
      console.log(`[AUDIT_SUCCESS] Pulse results locked into database.`);
    }

    console.log(`[HEARTBEAT] Pulse Complete. Sleeping for 6 hours...`);
    setTimeout(pulse, PULSE_INTERVAL_MS);

  } catch (err) {
    console.error(`[HEARTBEAT_CRASH] Critical failure during pulse:`, err.message);
    
    // Log Failure
    await supabase.from('sync_audit_logs').insert([{
      pulse_type: 'HEARTBEAT',
      status: 'FAIL',
      error_message: err.message
    }]).catch(() => {});

    console.log(`[RETRY] Self-healing initiated. Retrying in 15 minutes...`);
    setTimeout(pulse, RETRY_DELAY_MS);
  }
}

// Start the Heartbeat
console.log("--- KISANPULSE HEARTBEAT SERVICE INITIALIZED ---");
console.log(`Interval: Every 6 Hours`);
pulse();
