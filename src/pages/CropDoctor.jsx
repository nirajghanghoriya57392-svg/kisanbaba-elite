import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Upload, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  Leaf, 
  Droplets, 
  Thermometer,
  ArrowRight,
  Info
} from 'lucide-react';
import SEO from '../components/SEO';
import './CropDoctor.css';

const CropDoctor = () => {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      analyzeImage();
    }
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    setDiagnosis(null);
    // Simulate AI Analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setDiagnosis({
        crop: 'Wheat',
        condition: i18n.language === 'hi' ? 'पीला रतुआ (Yellow Rust)' : 'Yellow Rust',
        confidence: '98.4%',
        severity: 'Moderate',
        treatment: i18n.language === 'hi' 
          ? 'प्रोपीकोनाज़ोल 25% ईसी @ 200 मिली प्रति एकड़ का छिड़काव करें।' 
          : 'Spray Propiconazole 25% EC @ 200 ml per acre.',
        prevention: i18n.language === 'hi'
          ? 'प्रतिरोधी किस्मों का उपयोग करें और समय पर बुवाई करें।'
          : 'Use resistant varieties and ensure timely sowing.'
      });
    }, 2500);
  };

  return (
    <div className="crop-doctor-container">
      <SEO 
        title={i18n.language === 'hi' ? 'फसल डॉक्टर - किसानबाबा' : 'Crop Doctor - KisanBaba'}
        description="AI-powered crop disease detection and treatment protocols."
      />

      <header className="doctor-header">
        <h1>{i18n.language === 'hi' ? 'फसल डॉक्टर AI' : 'Crop Doctor AI'}</h1>
        <p>{t('doctor.subtitle', { defaultValue: 'Instant field diagnostics powered by deep learning.' })}</p>
      </header>

      <main className="doctor-main">
        <section className="upload-section glass-card">
          <div className="upload-zone">
            {selectedImage ? (
              <div className="preview-container">
                <img src={selectedImage} alt="Crop preview" className="crop-preview" />
                <button className="reupload-btn" onClick={() => setSelectedImage(null)}>
                  <Upload size={16} /> {i18n.language === 'hi' ? 'फिर से अपलोड करें' : 'Retake'}
                </button>
              </div>
            ) : (
              <label className="upload-label">
                <div className="upload-placeholder">
                  <Camera size={48} className="upload-icon" />
                  <span>{i18n.language === 'hi' ? 'फोटो लें या अपलोड करें' : 'Capture or Upload Photo'}</span>
                  <p>{i18n.language === 'hi' ? 'पौधे के प्रभावित हिस्से की स्पष्ट फोटो लें' : 'Take a clear photo of the affected area'}</p>
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
            )}
          </div>

          {isAnalyzing && (
            <div className="analysis-overlay">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="scanning-line"
              />
              <p>{i18n.language === 'hi' ? 'एआई विश्लेषण कर रहा है...' : 'AI is analyzing tissues...'}</p>
            </div>
          )}
        </section>

        <AnimatePresence>
          {diagnosis && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="diagnosis-result glass-card"
            >
              <div className="result-header">
                <ShieldCheck color="var(--nature-green)" size={24} />
                <h3>{i18n.language === 'hi' ? 'निदान रिपोर्ट' : 'Diagnostic Report'}</h3>
                <span className="confidence-badge">{diagnosis.confidence} Match</span>
              </div>

              <div className="result-grid">
                <div className="result-item">
                  <span className="label">{i18n.language === 'hi' ? 'फसल' : 'Crop'}</span>
                  <span className="value">{diagnosis.crop}</span>
                </div>
                <div className="result-item">
                  <span className="label">{i18n.language === 'hi' ? 'रोग' : 'Issue'}</span>
                  <span className="value status-warning">{diagnosis.condition}</span>
                </div>
                <div className="result-item">
                  <span className="label">{i18n.language === 'hi' ? 'गंभीरता' : 'Severity'}</span>
                  <span className="value text-warning">{diagnosis.severity}</span>
                </div>
              </div>

              <div className="treatment-box">
                <h4><AlertCircle size={18} /> {i18n.language === 'hi' ? 'तत्काल उपचार' : 'Immediate Treatment'}</h4>
                <p>{diagnosis.treatment}</p>
              </div>

              <div className="prevention-box">
                <h4><Info size={18} /> {i18n.language === 'hi' ? 'रोकथाम सलाह' : 'Prevention Advice'}</h4>
                <p>{diagnosis.prevention}</p>
              </div>

              <button className="expert-connect-btn">
                {i18n.language === 'hi' ? 'विशेषज्ञ से बात करें' : 'Talk to Agri-Expert'} <ArrowRight size={18} />
              </button>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="common-issues">
          <h3>{i18n.language === 'hi' ? 'सामान्य समस्याएं' : 'Most Common Issues'}</h3>
          <div className="issues-grid">
            <div className="issue-mini-card">
              <Leaf size={20} color="#10b981" />
              <span>{i18n.language === 'hi' ? 'एफिड्स' : 'Aphids'}</span>
            </div>
            <div className="issue-mini-card">
              <Droplets size={20} color="#3b82f6" />
              <span>{i18n.language === 'hi' ? 'डाउनिल मिल्ड्यू' : 'Downy Mildew'}</span>
            </div>
            <div className="issue-mini-card">
              <Thermometer size={20} color="#ef4444" />
              <span>{i18n.language === 'hi' ? 'ब्लाइट' : 'Blight'}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CropDoctor;
