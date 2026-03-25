import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sprout, ArrowLeft, Ruler, Wind } from 'lucide-react';
import './MicroCalculators.css';

export default function SeedRateCalculator() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState('wheat');
  const [area, setArea] = useState(1); 
  const [method, setMethod] = useState('line');

  // Seed rate baselines in KG per Acre
  const seedRates = {
     wheat: { name: t('crops.wheat', { defaultValue: "Wheat" }), line: 40, broadcast: 50 },
     paddy: { name: t('crops.paddy_direct', { defaultValue: "Paddy (Direct Seeded)" }), line: 12, broadcast: 15 },
     maize: { name: t('crops.maize', { defaultValue: "Maize" }), line: 8, broadcast: 10 },
     chickpea: { name: t('crops.chickpea', { defaultValue: "Gram (Chana)" }), line: 30, broadcast: 35 },
     mustard: { name: t('crops.mustard', { defaultValue: "Mustard" }), line: 2, broadcast: 2.5 }
  };

  const currentCrop = seedRates[crop];
  const requiredSeed = (currentCrop[method] * area).toFixed(1);

  return (
    <div className="micro-calc-wrapper seed-bg">
       <header className="micro-header">
           <Link to="/" className="back-btn">
              <ArrowLeft size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
              {t('calc.back', { defaultValue: 'Back' })}
           </Link>
           <div className="kb-logo">KisanBaba 🌱</div>
       </header>
       
       <main className="micro-main">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-card full-width-card"
            >
                <h1 className="micro-title">{t('calc.seed.title', { defaultValue: 'Seed Density & Quantity' })}</h1>
                <p className="micro-subtitle">{t('calc.seed.subtitle', { defaultValue: 'Optimize your sowing patterns. Minimize seed waste. Maximize germination density.' })}</p>
                
                <div className="config-panel">
                    <div className="config-block">
                        <label className="rural-label">{t('calc.common.selectSeed', { defaultValue: 'Select Seed Type' })}</label>
                        <select className="rural-select" value={crop} onChange={e => setCrop(e.target.value)}>
                           {Object.keys(seedRates).map(k => (
                              <option key={k} value={k}>{seedRates[k].name}</option>
                           ))}
                        </select>
                    </div>
                    
                    <div className="config-block">
                        <label className="rural-label">{t('calc.seed.method', { defaultValue: 'Sowing Method' })}</label>
                        <select className="rural-select" value={method} onChange={e => setMethod(e.target.value)}>
                           <option value="line">{t('calc.seed.methodLine', { defaultValue: 'Line Sowing / Drill' })}</option>
                           <option value="broadcast">{t('calc.seed.methodBroadcast', { defaultValue: 'Broadcasting (Chhitkawan)' })}</option>
                        </select>
                    </div>
                    
                    <div className="config-block" style={{gridColumn: '1 / -1'}}>
                        <label className="rural-label">{t('calc.common.farmArea', { defaultValue: 'Farm Area' })}: <span className="rural-value">{area} {t('calc.common.acres', { defaultValue: 'Acres' })}</span></label>
                        <input type="range" min="0.5" max="50" step="0.5" value={area} onChange={e => setArea(parseFloat(e.target.value))} />
                    </div>
                </div>

                <div className="giant-result">
                   <h4>{t('calc.seed.resultTitle', { defaultValue: 'Recommended Seed Quantity' })}</h4>
                   <div className="giant-number">{requiredSeed} <span className="unit">KG</span></div>
                   <p>{t('calc.seed.resultDesc', { defaultValue: 'Calculated using standardized agronomic density models.' })}</p>
                </div>
                
                <div className="pro-tip warning-tip">
                   <strong>⚠️ {t('calc.seed.treatmentTitle', { defaultValue: 'Essential Treatment:' })}</strong> 
                   {t('calc.seed.treatmentText', { defaultValue: 'Treat seeds with Trichoderma (5g/kg) and standard fungicide to prevent soil-borne pathogens.' })}
                </div>
            </motion.div>
        </main>
    </div>
  );
}
