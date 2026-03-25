import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Globe, 
  Cpu, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './VisionLanding.css';

const VisionLanding = () => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const visions = [
    { title: 'Hyper-Local Discovery', desc: 'Every village, every crop, indexed by AI for maximum profit.', icon: <Globe /> },
    { title: 'Neural Agronomy', desc: 'Crop diagnostics that understand local soil chemistry better than the human eye.', icon: <Cpu /> },
    { title: 'Zero-Friction Arbitrage', desc: 'Logistics and price gaps bridged by autonomous intelligence.', icon: <TrendingUp /> },
  ];

  return (
    <div className="vision-container" ref={containerRef}>
      <SEO 
        title="KisanBaba Vision - Elite Agricultural Future"
        description="Exploring the next frontier of AI-enhanced agriculture for the Indian farmer."
      />

      {/* Hero Section */}
      <section className="vision-hero">
        <motion.div style={{ opacity, scale }} className="hero-floating-content">
          <div className="vision-badge">
            <Sparkles size={14} fill="currentColor" />
            VISION 2030
          </div>
          <h1>The <span>Invisible Hand</span> of Indian Agriculture</h1>
          <p>We aren't just building a website. We are building the operating system for rural prosperity.</p>
          <div className="hero-scroll-invite">
            <span className="mouse-wheel"></span>
            Scroll to see the future
          </div>
        </motion.div>
      </section>

      {/* Core Principles */}
      <section className="vision-principles">
        <div className="principles-grid">
          {visions.map((v, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="principle-card glass-card"
            >
              <div className="principle-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="vision-manifesto">
        <div className="manifesto-content">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Our Commitment to the <span>Mitti</span>
          </motion.h2>
          <div className="manifesto-grid">
            <div className="manifesto-item">
              <ShieldCheck size={32} color="var(--nature-green)" />
              <h4>Radical Transparency</h4>
              <p>Direct from satellite to farmer. No middlemen, no manipulated data. Just the pure pulse of the market.</p>
            </div>
            <div className="manifesto-item">
              <Zap size={32} color="var(--prosperity-gold)" />
              <h4>Prescriptive Power</h4>
              <p>Don't just see the weather—know exactly when to spray, sow, or sell based on IMD-Aero sync.</p>
            </div>
            <div className="manifesto-item">
              <Award size={32} color="#8b5cf6" />
              <h4>Institutional Grade</h4>
              <p>Farmers deserve the same technology used by global hedge funds. We provide it for free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="vision-cta">
        <div className="cta-box glass-card">
          <h2>Ready to join the <span>Elite?</span></h2>
          <p>Start your journey toward data-driven prosperity today.</p>
          <Link to="/" className="vision-cta-btn">
            Open Command Center <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="vision-footer">
        <div className="v-footer-content">
          <span className="v-logo">KisanBaba™</span>
          <p>Architecting the Agriculture of Tomorrow.</p>
        </div>
      </footer>
    </div>
  );
};

export default VisionLanding;
