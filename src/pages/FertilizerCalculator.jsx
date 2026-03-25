import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Leaf, FlaskConical, Beaker, ArrowLeft } from 'lucide-react';
import './MicroCalculators.css';

export default function FertilizerCalculator() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState('paddy');
  const [area, setArea] = useState(1); 
  
  // Basic NPK recommendation logic per Acre (ICAR Baselines)
  const recommendations = {
     paddy: { name: t('crops.paddy', { defaultValue: "Paddy (Kharif)" }), urea: 2.5, ssp: 3, mop: 1, spacing: "20x15 cm" },
     wheat: { name: t('crops.wheat', { defaultValue: "Wheat" }), urea: 2.5, ssp: 3, mop: 1.5, spacing: "22.5 cm rows" },
     maize: { name: t('crops.maize', { defaultValue: "Maize" }), urea: 3, ssp: 2.5, mop: 1, spacing: "60x20 cm" },
     sugarcane: { name: t('crops.sugarcane', { defaultValue: "Sugarcane" }), urea: 6, ssp: 4, mop: 2, spacing: "90 cm rows" },
     cotton: { name: t('crops.cotton', { defaultValue: "Cotton (Bt)" }), urea: 3, ssp: 2, mop: 1, spacing: "90x90 cm" },
     tomato: { name: t('crops.tomato', { defaultValue: "Tomato" }), urea: 4, ssp: 3.5, mop: 2, spacing: "60x45 cm" }
  };

  const currentRec = recommendations[crop];

  return (
    <div className="micro-calc-wrapper">
       <header className="micro-header">
           <Link to="/" className="back-btn">
              <ArrowLeft size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
              {t('calc.back', { defaultValue: 'Back' })}
           </Link>
           <div className="kb-logo">KisanBaba 🧪</div>
       </header>
       
       <main className="micro-main">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-card full-width-card"
            >
                <h1 className="micro-title">{t('calc.fert.title', { defaultValue: 'Nutrient Intelligence' })}</h1>
                <p className="micro-subtitle">{t('calc.fert.subtitle', { defaultValue: 'Precision NPK modeling for optimal yield and cost reduction.' })}</p>
                
                <div className="config-panel">
                    <div className="config-block">
                        <label className="rural-label">{t('calc.common.selectCrop', { defaultValue: 'Select Crop' })}</label>
                        <select className="rural-select" value={crop} onChange={e => setCrop(e.target.value)}>
                           {Object.keys(recommendations).map(k => (
                              <option key={k} value={k}>{recommendations[k].name}</option>
                           ))}
                        </select>
                    </div>
                    
                    <div className="config-block">
                        <label className="rural-label">{t('calc.common.farmArea', { defaultValue: 'Farm Area' })}: <span className="rural-value">{area} {t('calc.common.acres', { defaultValue: 'Acres' })}</span></label>
                        <input type="range" min="0.5" max="50" step="0.5" value={area} onChange={e => setArea(parseFloat(e.target.value))} />
                    </div>
                </div>

                <div className="results-grid">
                    <div className="bag-card">
                       <div className="bag-icon"><Beaker size={48} color="#166534" /></div>
                       <h4>{t('calc.fert.urea', { defaultValue: 'Urea (Nitrogen)' })}</h4>
                       <div className="bag-count">{Math.ceil(currentRec.urea * area)}</div>
                       <small>{t('calc.fert.bags45', { defaultValue: 'Bags (45kg)' })}</small>
                    </div>
                    <div className="bag-card">
                       <div className="bag-icon"><FlaskConical size={48} color="#9a3412" /></div>
                       <h4>{t('calc.fert.ssp', { defaultValue: 'SSP (Phosphate)' })}</h4>
                       <div className="bag-count">{Math.ceil(currentRec.ssp * area)}</div>
                       <small>{t('calc.fert.bags50', { defaultValue: 'Bags (50kg)' })}</small>
                    </div>
                    <div className="bag-card">
                       <div className="bag-icon"><Leaf size={48} color="#b91c1c" /></div>
                       <h4>{t('calc.fert.mop', { defaultValue: 'MOP (Potash)' })}</h4>
                       <div className="bag-count">{Math.ceil(currentRec.mop * area)}</div>
                       <small>{t('calc.fert.bags50', { defaultValue: 'Bags (50kg)' })}</small>
                    </div>
                </div>
                
                <div className="pro-tip">
                   <strong>💡 {t('calc.common.proTip', { defaultValue: 'Agronomy Insight' })}:</strong> 
                   {t('calc.fert.tip', { defaultValue: 'Apply nitrogen in splits for 30% better absorption. Basal, Tillering, and Panicle stages are critical.' })}
                </div>
            </motion.div>
        </main>
    </div>
  );
}
