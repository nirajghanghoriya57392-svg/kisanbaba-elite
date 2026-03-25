import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Lock, 
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import libraryData from '../data/farming_library.json';
import './ProgressiveFarmingLibrary.css';

const categories = [
  "All",
  "High-Yield & Exotic Fruits",
  "High-Value Vegetables & Polyhouse",
  "Spices & Condiments",
  "Medicinal & Aromatic Plants",
  "Commercial Floricultural",
  "Timber & Long-Term Cash Crops"
];

export default function ProgressiveFarmingLibrary() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = libraryData.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="library-wrapper">
      <header className="library-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} /> {t('calc.back', { defaultValue: 'Back' })}
        </Link>
        <div className="header-content">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="library-title"
          >
            Elite <span>Farming</span> Library
          </motion.h1>
          <p className="library-subtitle">50+ Progressive Farming Models for the Modern Indian Farmer</p>
        </div>
      </header>

      <div className="library-controls glass-card">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search crop or practice..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-scroll">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="library-grid"
      >
        <AnimatePresence>
          {filteredItems.map(item => (
            <motion.div 
              key={item.id}
              variants={itemAnim}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
              className={`library-card glass-card ${item.status}`}
            >
              <div className="card-badge-row">
                <span className="category-tag">{item.category}</span>
                {item.status === 'coming-soon' ? (
                  <span className="status-tag soon"><Lock size={12} /> Coming Soon</span>
                ) : (
                  <span className="status-tag active"><Sparkles size={12} /> Live</span>
                )}
              </div>
              
              <div className="card-main">
                <div className="crop-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <div className="card-footer">
                {item.status === 'published' ? (
                  <Link to={item.path} className="lib-action-btn primary">
                    {item.buttonText} <ChevronRight size={18} />
                  </Link>
                ) : (
                  <button className="lib-action-btn disabled">
                    Notify Me <TrendingUp size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <Search size={48} opacity={0.3} />
          <h3>No matches found</h3>
          <p>Try searching for different keywords or categories.</p>
        </div>
      )}
    </div>
  );
}
