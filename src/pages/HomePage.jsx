import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CloudSun, 
  Sprout, 
  TrendingUp, 
  MapPin, 
  Mic, 
  Search, 
  Bell, 
  ArrowRight, 
  Cpu, 
  Stethoscope, 
  BookOpen, 
  Coins,
  Wind,
  Droplets,
  Calendar,
  Zap,
  ChevronRight,
  Info,
  Menu,
  X,
  Smartphone,
  ShieldCheck,
  Award,
  Users,
  MessageSquare
} from 'lucide-react';
import { fetchWeatherShieldData } from '../utils/api';
import { speakText, stopSpeech } from '../utils/speech';
import SEO from '../components/SEO';
import './HomePage.css';

// Mock weather data fallback
const FALLBACK_WEATHER = {
  temp: 32,
  condition: 'Sunny',
  humidity: 45,
  wind: 12,
  alerts: []
};

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        const data = await fetchWeatherShieldData('Indore', 'Wheat');
        setWeather({
          temp: data.rawData.temp,
          condition: data.rawData.rainProb > 40 ? 'Rainy' : 'Clear',
          humidity: data.rawData.humidity,
          wind: data.rawData.windSpeed,
          alerts: data.panels.find(p => p.id === 'emergency')?.items || []
        });
      } catch (err) {
        setWeather(FALLBACK_WEATHER);
      }
    };
    getWeatherData();
  }, []);

  const handleVoiceCommand = () => {
    setIsListening(true);
    speakText(t('home.voice.listening', { defaultValue: 'Listening... How can I help you today?' }), i18n.language === 'hi' ? 'hi-IN' : 'en-US');
    
    // Simulate speech recognition end
    setTimeout(() => {
      setIsListening(false);
      stopSpeech();
      // Mock action
      speakText(t('home.voice.response', { defaultValue: 'Opening Mandi Dashboard for current rates.' }), i18n.language === 'hi' ? 'hi-IN' : 'en-US');
      setTimeout(() => navigate('/mandi'), 1500);
    }, 3000);
  };

  const menuItems = [
    { id: 'mandi', icon: <TrendingUp />, label: t('nav.mandi'), path: '/mandi', color: '#10b981' },
    { id: 'weather', icon: <CloudSun />, label: t('nav.weather'), path: '/weather', color: '#3b82f6' },
    { id: 'doctor', icon: <Stethoscope />, label: t('nav.cropDoctor'), path: '/crop-doctor', color: '#ef4444' },
    { id: 'calc', icon: <Cpu />, label: t('nav.calculator'), path: '/calc/fertilizer', color: '#f59e0b' },
    { id: 'library', icon: <BookOpen />, label: t('nav.library'), path: '/library', color: '#8b5cf6' },
    { id: 'animal', icon: <Award />, label: t('nav.animal'), path: '/animal', color: '#ec4899' },
    { id: 'kisanbhai', icon: <Users />, label: t('nav.kisanbhai'), path: '/kisanbhai', color: '#06b6d4' },
    { id: 'news', icon: <Bell />, label: t('nav.news'), path: '/news', color: '#f97316' },
  ];

  return (
    <div className="home-wrapper">
      <SEO 
        title={i18n.language === 'hi' ? 'किसानबाबा - उन्नत कृषि' : 'KisanBaba - Advanced Farming'}
        description={i18n.language === 'hi' 
          ? 'किसानबाबा: भारतीय किसानों के लिए एआई-संचालित मंडी भाव, मौसम पूर्वानुमान और फसल सुरक्षा मंच।' 
          : 'KisanBaba: AI-powered market rates, weather forecasts, and crop protection for Indian farmers.'}
      />

      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-container">
          <div className="brand-group">
            <span className="kb-logo">KisanBaba 🪴</span>
          </div>
          <div className="nav-actions">
             <button className="lang-toggle" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}>
               {i18n.language === 'en' ? 'हिंदी' : 'English'}
             </button>
             <Link to="/admin" className="admin-link">🛡️</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="home-hero">
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-badge"
          >
            <Zap size={14} fill="currentColor" />
            {t('home.hero.badge', { defaultValue: 'Next-Gen Farming Command Center' })}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hero-title"
          >
            {i18n.language === 'hi' ? 'खेती की नयी ' : 'The Future of '} <span>{i18n.language === 'hi' ? 'शक्ति' : 'Smart Farming'}</span>
          </motion.h1>
          <p className="hero-subtitle">
            {t('home.hero.subtitle', { defaultValue: 'AI-Enhanced market intelligence and precision agriculture in your pocket.' })}
          </p>
          
          <div className="hero-search">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder={t('home.search.placeholder', { defaultValue: 'Search Mandi rates, Crop issues...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="voice-search-btn" onClick={handleVoiceCommand}>
              <Mic fill={isListening ? 'var(--nature-green)' : 'none'} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="dashboard-container">
        {/* Weather Quick Widget */}
        <section className="dashboard-row">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="weather-widget glass-card"
            onClick={() => navigate('/weather')}
          >
            <div className="widget-header">
              <span className="live-tag">LIVE</span>
              <h3>{t('home.weather.title', { defaultValue: 'Mausam Kavach' })}</h3>
            </div>
            {weather ? (
              <div className="weather-data">
                <div className="main-temp">
                  <span className="temp-val">{weather.temp}°</span>
                  <span className="condition">{weather.condition}</span>
                </div>
                <div className="metri-grid">
                  <div className="mini-metric">
                    <Droplets size={16} />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="mini-metric">
                    <Wind size={16} />
                    <span>{weather.wind} km/h</span>
                  </div>
                </div>
                {weather.alerts.length > 0 && (
                  <div className="weather-alert-mini">
                    <AlertTriangle size={14} />
                    <span>{weather.alerts[0].name}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="loading-shimmer"></div>
            )}
            <div className="widget-footer">
               <span>View Detailed Radar</span>
               <ChevronRight size={16} />
            </div>
          </motion.div>

          {/* Mandi Quick View */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="mandi-widget glass-card"
            onClick={() => navigate('/mandi')}
          >
            <div className="widget-header">
              <TrendingUp size={20} color="#10b981" />
              <h3>{t('home.mandi.title', { defaultValue: 'Market Pulse' })}</h3>
            </div>
            <div className="price-ticker">
               <div className="ticker-item">
                 <span className="crop">Wheat</span>
                 <span className="price">₹2,450 📈</span>
               </div>
               <div className="ticker-item">
                 <span className="crop">Paddy</span>
                 <span className="price">₹2,183 📉</span>
               </div>
               <div className="ticker-item">
                 <span className="crop">Mustard</span>
                 <span className="price">₹5,620 ➖</span>
               </div>
            </div>
            <div className="widget-footer">
               <span>Open Discovery Engine</span>
               <ChevronRight size={16} />
            </div>
          </motion.div>
        </section>

        {/* Action Grid */}
        <section className="action-grid">
          {menuItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className="action-card glass-card"
              onClick={() => navigate(item.path)}
              style={{ '--accent-color': item.color }}
            >
              <div className="action-icon">
                {item.icon}
              </div>
              <span className="action-label">{item.label}</span>
            </motion.div>
          ))}
        </section>

        {/* AI Insight Highlight */}
        <section className="insight-highlight">
           <div className="insight-card glass-card">
              <div className="insight-inner">
                <div className="insight-icon">🧠</div>
                <div className="insight-content">
                  <h4>{t('home.insight.title', { defaultValue: 'Elite Farming Strategy' })}</h4>
                  <p>{t('home.insight.text', { defaultValue: 'Satellite data shows ideal soil moisture in Indore region. Best time for micronutrient spray for Wheat.' })}</p>
                </div>
                <button className="insight-action">
                  Apply <ArrowRight size={16} />
                </button>
              </div>
           </div>
        </section>

        {/* Feature Teasers */}
        <section className="feature-teasers">
           <div className="teaser-card">
              <div className="teaser-img doctor-bg"></div>
              <div className="teaser-body">
                <h3>{t('home.teasers.doctor.title', { defaultValue: 'Crop Doctor AI' })}</h3>
                <p>{t('home.teasers.doctor.desc', { defaultValue: 'Identify pests and diseases with 98% accuracy.' })}</p>
                <Link to="/crop-doctor" className="teaser-link">Start Scan</Link>
              </div>
           </div>
           <div className="teaser-card">
              <div className="teaser-img library-bg"></div>
              <div className="teaser-body">
                <h3>{t('home.teasers.lib.title', { defaultValue: 'Agri-Academy' })}</h3>
                <p>{t('home.teasers.lib.desc', { defaultValue: 'Master 50+ high-yield farming models.' })}</p>
                <Link to="/library" className="teaser-link">Browse Library</Link>
              </div>
           </div>
        </section>
      </main>

      {/* Trust & Stats Section */}
      <section className="trust-section">
         <div className="trust-grid">
           <div className="stat-item">
             <span className="stat-num">1.2M+</span>
             <span className="stat-label">Farmers Empowered</span>
           </div>
           <div className="stat-item">
             <span className="stat-num">95%</span>
             <span className="stat-label">Market Accuracy</span>
           </div>
           <div className="stat-item">
             <span className="stat-num">24/7</span>
             <span className="stat-label">AI Support</span>
           </div>
         </div>
      </section>

      {/* Footer Branding */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-branding">
            <span className="kb-logo">KisanBaba 🌱</span>
            <p>Made with ❤️ for Indian Farmers</p>
          </div>
          <div className="footer-links">
            <Link to="/vision">AI Vision</Link>
            <Link to="/admin">Admin Control</Link>
            <a href="https://t.me/kisanbaba" target="_blank">Telegram Community</a>
          </div>
          <p className="copyright">© 2026 KisanBaba Elite. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Bottom Bar (Mobile First Navigation) */}
      <div className="bottom-nav">
        <Link to="/" className="bnav-item active">
          <MapPin size={20} />
          <span>Home</span>
        </Link>
        <Link to="/mandi" className="bnav-item">
          <TrendingUp size={20} />
          <span>Mandi</span>
        </Link>
        <button className="bnav-item mic-center" onClick={handleVoiceCommand}>
          <div className="mic-circle">
            <Mic size={24} color="#fff" />
          </div>
        </button>
        <Link to="/weather" className="bnav-item">
          <CloudSun size={20} />
          <span>Weather</span>
        </Link>
        <Link to="/crop-doctor" className="bnav-item">
          <Stethoscope size={20} />
          <span>Doctor</span>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
