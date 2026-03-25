import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calculator, Sprout, Info, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import './MicroCalculators.css';

const FertilizerCalculator = () => {
  const { t, i18n } = useTranslation();
  const [inputs, setInputs] = useState({ area: '', crop: 'wheat' });
  const [result, setResult] = useState(null);

  const calculate = () => {
    // Basic NPK calculation logic
    const area = parseFloat(inputs.area) || 0;
    const n = area * 50;
    const p = area * 25;
    const k = area * 25;
    setResult({ n, p, k });
  };

  return (
    <div className="micro-calc-container">
      <SEO title="Fertilizer Calculator - KisanBaba" />
      <header className="calc-header">
        <Calculator size={32} color="var(--prosperity-gold)" />
        <h1>{i18n.language === 'hi' ? 'खाद कैलकुलेटर' : 'Fertilizer Calculator'}</h1>
      </header>

      <main className="calc-card glass-card">
        <div className="input-row">
          <label>{i18n.language === 'hi' ? 'फसल चुनें' : 'Select Crop'}</label>
          <select onChange={(e) => setInputs({...inputs, crop: e.target.value})}>
            <option value="wheat">Wheat / गेहूं</option>
            <option value="paddy">Paddy / धान</option>
            <option value="mustard">Mustard / सरसों</option>
          </select>
        </div>
        <div className="input-row">
          <label>{i18n.language === 'hi' ? 'क्षेत्रफल (एकड़)' : 'Area (Acre)'}</label>
          <input 
            type="number" 
            placeholder="e.g. 5" 
            value={inputs.area}
            onChange={(e) => setInputs({...inputs, area: e.target.value})}
          />
        </div>
        <button className="calc-btn" onClick={calculate}>
          {i18n.language === 'hi' ? 'गणना करें' : 'Calculate NPK'}
        </button>

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="result-display">
            <div className="res-item">
              <span className="res-label">Nitrogen (N)</span>
              <span className="res-val">{result.n} kg</span>
            </div>
            <div className="res-item">
              <span className="res-label">Phosphorus (P)</span>
              <span className="res-val">{result.p} kg</span>
            </div>
            <div className="res-item">
              <span className="res-label">Potassium (K)</span>
              <span className="res-val">{result.k} kg</span>
            </div>
          </motion.div>
        )}
      </main>

      <section className="calc-tips glass-card">
        <h4><Info size={16} /> Application Tip</h4>
        <p>Apply 50% of Nitrogen as basal dose during sowing. Use remaining as top-dressing after first irrigation.</p>
      </section>
    </div>
  );
};

export default FertilizerCalculator;
