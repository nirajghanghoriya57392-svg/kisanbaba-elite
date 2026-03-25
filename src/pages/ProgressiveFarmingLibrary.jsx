import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  Search, 
  Leaf, 
  Sprout, 
  Droplets, 
  Dna, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Filter
} from 'lucide-react';
import SEO from '../components/SEO';
import './ProgressiveFarmingLibrary.css';

const ProgressiveFarmingLibrary = () => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('all');

  const models = [
    {
      id: 1,
      title: 'ZBNF (Zero Budget Natural Farming)',
      category: 'Organic',
      complexity: 'Medium',
      icon: <Leaf />,
      benefit: '↓ 90% Costs',
      desc: 'Master the art of Jeevamrutha and Bijamrutha for chemical-free high yield.'
    },
    {
      id: 2,
      title: 'Vertical Hydroponics',
      category: 'Tech',
      complexity: 'High',
      icon: <Sprout />,
      benefit: '↑ 5x Yield',
      desc: 'Precise nutrient control in vertical layers. Ideal for high-value strawberries and leafy greens.'
    },
    {
      id: 3,
      title: 'Precision Drip Irrigation',
      category: 'Hydrology',
      complexity: 'Low',
      icon: <Droplets />,
      benefit: '↓ 60% Water',
      desc: 'Automated water delivery system synchronized with soil moisture sensors.'
    },
    {
      id: 4,
      title: 'Multi-Layer Cropping',
      category: 'Traditional',
      complexity: 'Medium',
      icon: <Calendar />,
      benefit: '↑ 300% Income',
      desc: 'Grow 4-5 crops in the same field at different heights for maximum space utility.'
    }
  ];

  const filteredModels = filter === 'all' ? models : models.filter(m => m.category.toLowerCase() === filter.toLowerCase());

  return (
    <div className="library-container">
      <SEO 
        title={i18n.language === 'hi' ? 'प्रगतिशील खेती लाइब्रेरी - किसानबाबा' : 'Progressive Farming Library - KisanBaba'}
        description="Comprehensive guide to high-yield, modern agricultural practices."
      />

      <header className="lib-header">
         <div className="lib-badge"><BookOpen size={14} /> ELITE KNOWLEDGE HUB</div>
         <h1>{i18n.language === 'hi' ? 'उन्नत खेती मॉडल' : 'Advanced Farming Models'}</h1>
         <p>{i18n.language === 'hi' ? 'अपनी उपज और कमाई बढ़ाने के लिए आधुनिक तरीकें सीखें।' : 'Master the mechanics of high-yield institutional farming.'}</p>
      </header>

      <div className="lib-controls glass-card">
         <div className="search-bar">
           <Search size={20} />
           <input type="text" placeholder="Search models (e.g. Mushroom, Floriculture)..." />
         </div>
         <div className="filter-scroll">
           {['All', 'Organic', 'Tech', 'Hydrology', 'Traditional'].map(cat => (
             <button 
              key={cat} 
              className={`filter-btn ${filter === cat.toLowerCase() ? 'active' : ''}`}
              onClick={() => setFilter(cat.toLowerCase())}
             >
               {cat}
             </button>
           ))}
         </div>
      </div>

      <main className="models-grid">
         <AnimatePresence mode='popLayout'>
           {filteredModels.map((model, idx) => (
             <motion.div 
               key={model.id}
               layout
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="model-card glass-card"
             >
               <div className="model-icon-wrap" style={{ '--accent-color': idx % 2 === 0 ? 'var(--nature-green)' : 'var(--prosperity-gold)' }}>
                 {model.icon}
               </div>
               <div className="model-content">
                 <div className="model-meta">
                   <span className="cat">{model.category}</span>
                   <span className="comp">Difficulty: {model.complexity}</span>
                 </div>
                 <h3>{model.title}</h3>
                 <p>{model.desc}</p>
                 <div className="benefit-tag">
                   <TrendingUp size={14} /> {model.benefit}
                 </div>
               </div>
               <button className="open-model-btn">
                 Study Model <ChevronRight size={18} />
               </button>
             </motion.div>
           ))}
         </AnimatePresence>
      </main>

      <section className="certified-notice glass-card">
         <div className="notice-inner">
           <div className="cert-icon">📜</div>
           <div className="cert-text">
             <h4>KisanBaba Certified Training</h4>
             <p>Our models are verified by top agricultural scientists and successful progressive farmers.</p>
           </div>
         </div>
      </section>
    </div>
  );
};

export default ProgressiveFarmingLibrary;
