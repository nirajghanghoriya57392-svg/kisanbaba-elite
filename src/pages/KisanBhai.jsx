import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  PhoneCall, 
  MessageCircle, 
  ShieldAlert, 
  Users, 
  Pencil,
  ArrowRight,
  Sparkles,
  Info,
  CalendarDays,
  Gem
} from 'lucide-react';
import SEO from '../components/SEO';
import './KisanBhai.css';

const KisanBhai = () => {
  const { t, i18n } = useTranslation();
  const [sosOpen, setSosOpen] = useState(false);
  const [pledgeSigned, setPledgeSigned] = useState(false);

  const programs = [
    { title: 'Farmer Brotherhood', desc: 'No farmer stands alone. Connect with 10 nearest peers.', icon: <Users /> },
    { title: 'Mental Resilience', desc: 'AI-guided protocols for stress management during drought.', icon: <ShieldAlert /> },
    { title: 'Elite Family Shield', desc: 'Insurance and social security automated for your family.', icon: <Gem /> },
  ];

  return (
    <div className="kisanbhai-container">
      <SEO 
        title={i18n.language === 'hi' ? 'किसानभाई - भावनात्मक समर्थन' : 'KisanBhai - Emotional Support'}
        description="A dedicated space for farmer resilience, mental health, and community support."
      />

      <header className="kb-hero">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="kb-header-icon"
        >
          <Heart size={48} fill="var(--prosperity-gold)" color="var(--prosperity-gold)" />
        </motion.div>
        <h1>{i18n.language === 'hi' ? 'किसानभाई: आपका साथी' : 'KisanBhai: Your Brother'}</h1>
        <p className="kb-tagline">"Kisan hai toh Hindustan hai. Aap akele nahi hain."</p>
      </header>

      <main className="kb-content">
        {/* SOS Module */}
        <section className="sos-module glass-card">
          <div className="sos-content">
            <div className="sos-text">
              <h3>{i18n.language === 'hi' ? 'आपातकालीन सहायता (SOS)' : 'Emergency Support (SOS)'}</h3>
              <p>{i18n.language === 'hi' ? 'यदि आप किसी परेशानी में हैं, तो कृपया संकोच न करें।' : 'If you are in distress, please do not hesitate. We are here.'}</p>
            </div>
            <button className="sos-trigger-btn" onClick={() => setSosOpen(true)}>
              <PhoneCall size={20} /> {i18n.language === 'hi' ? 'मदद मांगें' : 'Get Immediate Help'}
            </button>
          </div>
        </section>

        {/* 90 Day Promise */}
        <section className="pledge-section glass-card">
           <div className="pledge-header">
             <CalendarDays size={24} color="var(--prosperity-gold)" />
             <h3>{i18n.language === 'hi' ? '90-दिन का स्वावलंबन संकल्प' : 'The 90-Day Resilience Pledge'}</h3>
           </div>
           <p className="pledge-text">
             Give us 90 days of your commitment. We promise a transformation in your field and your mindset through elite guidance.
           </p>
           {!pledgeSigned ? (
             <button className="sign-pledge-btn" onClick={() => setPledgeSigned(true)}>
               <Pencil size={18} /> Take the Pledge
             </button>
           ) : (
             <div className="pledge-success">
                <Sparkles size={20} /> <strong>Pledge Signed!</strong> Welcome to the Elite Brotherhood.
             </div>
           )}
        </section>

        {/* Feature Cards */}
        <div className="feature-grid">
          {programs.map((p, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="kb-feature-card glass-card"
            >
              <div className="feature-icon-blob">{p.icon}</div>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
              <button className="mini-action-btn">Learn More <ArrowRight size={14} /></button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* SOS MODAL */}
      <AnimatePresence>
        {sosOpen && (
          <div className="sos-modal-overlay">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="sos-modal"
            >
              <div className="modal-inner">
                <h2>Choose Your Help Channel</h2>
                <div className="contact-options">
                  <a href="tel:1800-XXX-XXXX" className="contact-card">
                    <PhoneCall size={32} />
                    <span>Expert Call</span>
                  </a>
                  <a href="https://wa.me/XXXXXXXXXX" className="contact-card">
                    <MessageCircle size={32} />
                    <span>WhatsApp Bhai</span>
                  </a>
                  <a href="/nearest-center" className="contact-card">
                    <Info size={32} />
                    <span>Nearest Hub</span>
                  </a>
                </div>
                <button className="close-modal-btn" onClick={() => setSosOpen(false)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KisanBhai;
