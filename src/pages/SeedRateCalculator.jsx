import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calculator, Shovel, Info, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import './MicroCalculators.css';

const SeedRateCalculator = () => {
  const { t, i18n } = useTranslation();
  const [inputs, setInputs] = useState({ area: '', crop: 'wheat' });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const area = parseFloat(inputs.area) || 0;
    const rate = inputs.crop === 'wheat' ? 40 : (inputs.crop === 'paddy' ? 8 : 2);
    setResult(area * rate);
  };

  return (
    <div className="micro-calc-container">
      <SEO title="Seed Rate Calculator - KisanBaba" />
      <header className="calc-header">
        <Calculator size={32} color="var(--nature-green)" />
        <h1>{i18n.language === 'hi' ? 'बीज दर कैलकुलेटर' : 'Seed Rate Calculator'}</h1>
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
          {i18n.language === 'hi' ? 'गणना करें' : 'Calculate Quantity'}
        </button>

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="result-display">
            <div className="res-summary">
              <span className="res-label">Total Seeds Required:</span>
              <span className="res-val">{result} kg</span>
            </div>
          </motion.div>
        )}
      </main>

      <section className="calc-tips glass-card">
        <h4><Info size={16} /> Elite Advice</h4>
        <p>Ensure seed treatment with Rhizobium or Azotobacter before sowing to increase germination by 20%.</p>
      </section>
    </div>
  );
};

export default SeedRateCalculator;
