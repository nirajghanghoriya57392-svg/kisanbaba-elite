import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  Newspaper,
  Share2,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import SEO from '../components/SEO';
import './NewsRadar.css';

const NewsRadar = () => {
  const { t, i18n } = useTranslation();
  
  const newsItems = [
    {
      id: 1,
      title: i18n.language === 'hi' ? 'गेहूं के समर्थन मूल्य में 150 रुपये की वृद्धि' : 'Wheat MSP hiked by ₹150 for upcoming season',
      category: 'Policy',
      time: '2 hours ago',
      source: 'Agri-Pulse',
      img: 'https://images.unsplash.com/photo-1594488651083-206e8f4705af?auto=format&fit=crop&q=80&w=400',
      summary: 'The government announces a significant hike in Minimum Support Price to empower cereal farmers...'
    },
    {
      id: 2,
      title: i18n.language === 'hi' ? 'ड्रोन तकनीक पर 50% सब्सिडी मिली' : '50% Subsidy announced on Agri-Drones',
      category: 'Tech',
      time: '4 hours ago',
      source: 'Tech-Kheti',
      img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400',
      summary: 'New state policy aims to bring precision mapping to small-hold farmers through shared drone pools.'
    },
    {
      id: 3,
      title: i18n.language === 'hi' ? 'जैविक खेती का बड़ा बाज़ार: निर्यात बढ़ा' : 'Organic Farming Exports hit record high',
      category: 'Market',
      time: '6 hours ago',
      source: 'Global Agri',
      img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=400',
      summary: 'Indian organic produce finds major traction in European markets. Premium pricing expected.'
    }
  ];

  return (
    <div className="news-radar-container">
      <SEO 
        title={i18n.language === 'hi' ? 'न्यूज़ रडार - किसानबाबा' : 'News Radar - KisanBaba'}
        description="Curated high-impact agricultural news and policy updates."
      />

      <header className="news-header">
        <div className="header-status">
          <Bell className="flash-icon" size={20} />
          <span>Real-time Update Hub</span>
        </div>
        <h1>{i18n.language === 'hi' ? 'एग्री न्यूज़ रडार' : 'Agri News Radar'}</h1>
      </header>

      <main className="news-feed">
        <section className="trending-strip glass-card">
           <TrendingUp size={18} color="var(--nature-green)" />
           <div className="ticker-wrap">
             <div className="ticker">
               <span>Paddy Exports Resume • New Fertilizer Subsidy Policy • IMD Monsoon Forecast Updated • Mandi Tax Waiver in MP</span>
             </div>
           </div>
        </section>

        <div className="news-grid">
          {newsItems.map((news, idx) => (
            <motion.article 
              key={news.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="news-card glass-card"
            >
              <div className="news-img-container">
                <img src={news.img} alt={news.title} />
                <span className="news-category">{news.category}</span>
              </div>
              <div className="news-body">
                <div className="news-meta">
                  <span className="source">{news.source}</span>
                  <span className="time"><Clock size={12} /> {news.time}</span>
                </div>
                <h3>{news.title}</h3>
                <p>{news.summary}</p>
                <div className="news-actions">
                   <button className="read-more">Read Full Story <ChevronRight size={16} /></button>
                   <div className="icon-group">
                     <Bookmark size={18} />
                     <Share2 size={18} />
                   </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      <aside className="quick-links glass-card">
         <h4>Institutional Resources</h4>
         <div className="resource-list">
           <a href="#pmkisasn"><ExternalLink size={14} /> PM Kisan Portal</a>
           <a href="#soilcard"><ExternalLink size={14} /> Soil Health Card</a>
           <a href="#enam"><ExternalLink size={14} /> e-NAM Trading</a>
         </div>
      </aside>
    </div>
  );
};

export default NewsRadar;
