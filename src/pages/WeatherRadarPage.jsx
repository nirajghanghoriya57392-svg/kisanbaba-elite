import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Map,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Sun
} from 'lucide-react';
import { fetchWeatherShieldData } from '../utils/api';
import { speakText } from '../utils/speech';
import SEO from '../components/SEO';
import { Volume2 } from 'lucide-react';
import './WeatherRadarPage.css';

const WeatherRadarPage = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const shieldData = await fetchWeatherShieldData('Indore', 'Wheat');
      setData(shieldData);
      setLoading(false);
    };
    loadData();
  }, [i18n.language]);

  if (loading) return (
    <div className="weather-loader">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="loader-disk"
      />
      <p>Synchronizing with NASA POWER & IMD Satellites...</p>
    </div>
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CRITICAL': return <XCircle className="status-icon critical" />;
      case 'WARNING': return <AlertTriangle className="status-icon warning" />;
      case 'SAFE':
      case 'OPTIMAL': return <CheckCircle2 className="status-icon safe" />;
      default: return <Activity className="status-icon info" />;
    }
  };

  return (
    <div className="weather-radar-container">
      <SEO 
        title={i18n.language === 'hi' ? 'मौसम कवच - किसानबाबा' : 'Mausam Kavach - KisanBaba'}
        description={i18n.language === 'hi'
          ? 'किसानबाबा मौसम कवच: कृषि कार्यों के लिए रियल-टाइम आईएमडी और नासा सैट-सिंक अलर्ट।'
          : 'KisanBaba Weather Shield: Real-time IMD & NASA Sat-Sync alerts for farm operations.'}
      />
      {/* 🚀 HEADER: COMMAND CENTER BRANDING */}
      <header className="radar-header">
        <div className="header-top">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            🌩️ {i18n.language === 'hi' ? 'मौसम कवच' : 'Mausam Kavach'}
          </motion.h1>
          <div className="live-status-pill">
            <span className="pulse-dot"></span>
            LIVE SAT-SYNC
          </div>
        </div>
        <p className="header-subtitle">
          {i18n.language === 'hi' 
            ? 'प्रो फार्म ऑपरेशंस कमांड: डेटा को एक्शन में बदलें' 
            : 'Pro Farm Operations Command: Translating Data into Commands'}
        </p>
      </header>

      {/* 🧠 WEATHER INTELLIGENCE STRATEGY SUMMARY */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="strategy-summary-card"
      >
        <div className="strategy-header">
          <Zap size={20} color="var(--prosperity-gold)" />
          <span>{i18n.language === 'hi' ? 'रणनीतिक इंटेलिजेंस:' : 'Strategic Intelligence:'} <strong>KAVACH-AI v1.0</strong></span>
        </div>
        <p className="strategy-mission">
          {i18n.language === 'hi' 
            ? 'आज का मिशन: रसायनों की बचत करना और सिंचाई को अनुकूलित करना। नासा और आईएमडी डेटा अगले 48 घंटों के लिए "उच्च अलर्ट" दिखा रहा है।' 
            : 'Today\'s Mission: Save chemicals and optimize irrigation. NASA & IMD data shows "High Alert" for the next 48 hours.'}
        </p>
        <div className="agent-badges">
          <span className="agent-badge">📡 NASA Hydra</span>
          <span className="agent-badge">🛰️ IMD Aero</span>
          <span className="agent-badge">🧬 Bio-Clock</span>
        </div>
      </motion.section>

      {/* 📊 LIVE METRICS BAR */}
      <section className="live-metrics-bar">
        <div className="metric-item">
          <Thermometer size={18} />
          <span>{data.rawData.temp}°C</span>
        </div>
        <div className="metric-item">
          <Wind size={18} />
          <span>{data.rawData.windSpeed} km/h {data.rawData.windDir}°</span>
        </div>
        <div className="metric-item">
          <Droplets size={18} />
          <span>{data.rawData.humidity}% RH</span>
        </div>
        <div className="metric-item">
          <CloudRain size={18} />
          <span>{data.rawData.rainProb}% Rain</span>
        </div>
      </section>

      {/* 🚜 ACTION PANELS GRID */}
      <main className="radar-main-grid">
        {data.panels.map((panel, idx) => (
          <motion.section 
            key={panel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`radar-panel ${panel.id === 'emergency' ? 'emergency-panel' : ''}`}
          >
            <div className="panel-header">
              <h3>{panel.title}</h3>
              <ShieldCheck size={20} className="shield-icon" />
            </div>

            <div className="item-list">
              {panel.items.map((item) => (
                <div key={item.id} className={`action-item ${item.status.toLowerCase()}`}>
                  <div className="item-main">
                    <div className="item-info">
                      <div className="item-top">
                        <span className="item-brand">{item.brand}</span>
                        <div className="item-controls">
                          <button 
                            className="speak-btn"
                            onClick={() => speakText(item.advice, i18n.language === 'hi' ? 'hi-IN' : 'en-US')}
                            title="Listen to Command"
                          >
                            <Volume2 size={16} />
                          </button>
                          {getStatusIcon(item.status)}
                        </div>
                      </div>
                      <h4>{item.name}</h4>
                      <p className="item-advice">{item.advice}</p>
                    </div>
                  </div>

                  {item.progress && (
                    <div className="progress-container">
                      <div className="progress-label">
                        <span>{i18n.language === 'hi' ? 'विकास प्रगति' : 'Growth Progress'}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          className="progress-fill"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </main>

      {/* 🧭 NAVIGATION FOOTER */}
      <footer className="radar-footer">
        <div className="sync-info">
          <Clock size={14} />
          <span>Last Sync: {new Date(data.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="disclaimer">
          {i18n.language === 'hi' 
            ? 'प्रीमियम डेटा स्रोत: NASA POWER, IMD, NOAA' 
            : 'Elite Data Sources: NASA POWER, IMD Agro-Met, NOAA'}
        </div>
      </footer>
    </div>
  );
};

export default WeatherRadarPage;
