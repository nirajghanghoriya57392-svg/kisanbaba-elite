import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Beef, 
  Droplets, 
  Activity, 
  Calendar, 
  Plus, 
  Zap, 
  Heart,
  AlertTriangle
} from 'lucide-react';
import SEO from '../components/SEO';
import './AnimalHusbandry.css';

const AnimalHusbandry = () => {
  const { t, i18n } = useTranslation();
  const [feedCalc, setFeedCalc] = useState({ weight: '', count: '', type: 'cow' });
  const [result, setResult] = useState(null);

  const calculateFeed = () => {
    const total = (parseFloat(feedCalc.weight) * 0.1) * parseInt(feedCalc.count);
    setResult(total.toFixed(2));
  };

  const schedule = [
    { id: 1, title: 'FMD Vaccination', date: 'Oct 15, 2026', status: 'Upcoming', priority: 'High' },
    { id: 2, title: 'Mineral Supplement', date: 'Daily', status: 'Active', priority: 'Medium' },
    { id: 3, title: 'Deworming', date: 'Nov 02, 2026', status: 'Scheduled', priority: 'High' },
  ];

  return (
    <div className="animal-husbandry-container">
      <SEO 
        title={i18n.language === 'hi' ? 'पशुपालन - किसानबाबा' : 'Animal Husbandry - KisanBaba'}
        description="Livestock health monitors, feed calculators, and vaccination trackers."
      />

      <header className="animal-header">
        <h1>{i18n.language === 'hi' ? 'स्मार्ट पशुपालन' : 'Smart Livestock'}</h1>
        <p>{t('animal.subtitle', { defaultValue: 'Elite management for healthy and productive livestock.' })}</p>
      </header>

      <div className="animal-grid">
        {/* Feed Calculator */}
        <section className="feed-card glass-card">
          <div className="card-header">
            <Beef size={24} color="#ec4899" />
            <h3>{i18n.language === 'hi' ? 'चारा कैलकुलेटर' : 'Feed Optimizer'}</h3>
          </div>
          <div className="calc-form">
            <div className="input-group">
              <label>{i18n.language === 'hi' ? 'पशु का प्रकार' : 'Livestock Type'}</label>
              <select onChange={(e) => setFeedCalc({...feedCalc, type: e.target.value})}>
                <option value="cow">Cow / गाय</option>
                <option value="buffalo">Buffalo / भैंस</option>
                <option value="goat">Goat / बकरी</option>
              </select>
            </div>
            <div className="input-group">
              <label>{i18n.language === 'hi' ? 'पशु का वजन (किग्रा)' : 'Avg Weight (kg)'}</label>
              <input type="number" value={feedCalc.weight} onChange={(e) => setFeedCalc({...feedCalc, weight: e.target.value})} />
            </div>
            <div className="input-group">
              <label>{i18n.language === 'hi' ? 'संख्या' : 'Head Count'}</label>
              <input type="number" value={feedCalc.count} onChange={(e) => setFeedCalc({...feedCalc, count: e.target.value})} />
            </div>
            <button className="calc-primary-btn" onClick={calculateFeed}>
              {i18n.language === 'hi' ? 'हिसाब करें' : 'Optimize Feed'}
            </button>
          </div>
          {result && (
            <div className="calc-result">
              <span>Total Dry Matter Needed:</span>
              <strong>{result} kg/day</strong>
            </div>
          )}
        </section>

        {/* Health Tracker */}
        <section className="health-card glass-card">
           <div className="card-header">
             <Heart size={24} color="#ef4444" />
             <h3>{i18n.language === 'hi' ? 'स्वस्थ निगरानी' : 'Health Radar'}</h3>
           </div>
           <div className="health-metrics">
              <div className="health-stat">
                <span className="stat-icon">🌡️</span>
                <div className="stat-info">
                  <span className="label">Body Temp</span>
                  <span className="value">101.5 °F</span>
                </div>
                <span className="status optimal">Normal</span>
              </div>
              <div className="health-stat">
                <span className="stat-icon">💧</span>
                <div className="stat-info">
                  <span className="label">Lactation</span>
                  <span className="value">12.5 L/day</span>
                </div>
                <span className="status trend-up">↑ 10%</span>
              </div>
           </div>
           <div className="sos-alert">
             <AlertTriangle size={16} />
             <span>Possible Heat Stress Detected in Sector B</span>
           </div>
        </section>

        {/* Schedule */}
        <section className="schedule-card glass-card">
          <div className="card-header">
            <Calendar size={24} color="#8b5cf6" />
            <h3>{i18n.language === 'hi' ? 'टीकाकरण समय सारणी' : 'Bio-Schedule'}</h3>
          </div>
          <div className="schedule-list">
            {schedule.map(item => (
              <div key={item.id} className="schedule-item">
                <div className="item-info">
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </div>
                <span className={`status-badge ${item.priority.toLowerCase()}`}>{item.status}</span>
              </div>
            ))}
          </div>
          <button className="add-task-btn">
            <Plus size={18} /> Schedule New Checkup
          </button>
        </section>
      </div>
    </div>
  );
};

export default AnimalHusbandry;
