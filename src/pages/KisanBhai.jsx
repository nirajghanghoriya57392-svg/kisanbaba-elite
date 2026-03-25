import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import './KisanBhai.css';

export default function KisanBhai() {
  const { t } = useTranslation();
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [sosOpen, setSosOpen] = useState(false);

  // Agent 2: Algorithmic Content Matrix generator (Mock representation)
  const daysArray = Array.from({ length: 90 }, (_, i) => i + 1);

  if (!pledgeAccepted) {
    return (
      <div className="kbhai-wrapper pledge-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card pledge-card"
        >
          <h1>🤝 Kisan<span>Bhai</span></h1>
          <h2 className="pledge-subtitle">{t('kisanbhai.hero.pledgeSubtitle', { defaultValue: 'Your Digital Brother. Always.' })}</h2>
          <div className="pledge-letter">
            <p>{t('kisanbhai.hero.pledgeText1', { defaultValue: 'Farming is the hardest job in the world. You face the rain, the debt, and the isolation alone.' })}</p>
            <p><strong>{t('kisanbhai.hero.pledgeText2', { defaultValue: "But you don't have to do it alone anymore." })}</strong></p>
            <p>{t('kisanbhai.hero.pledgeText3', { defaultValue: 'I am your digital brother. I will be here every single morning for the next 90 days. We will systematically solve your debt, increase your crop yield, and empower your family.' })}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="huge-button pledge-btn"
            style={{ 
              background: 'var(--nature-green)', 
              color: 'white', 
              fontWeight: '900',
              padding: '20px 40px',
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0, 200, 83, 0.4)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              marginTop: '20px'
            }}
            onClick={() => setPledgeAccepted(true)}
          >
            {t('kisanbhai.hero.pledgeBtn', { defaultValue: 'Take the Pledge of Friendship 🤝' })}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="kbhai-wrapper">
      <header className="kb-header kbhai-header">
        <div className="kb-logo">
          Kisan Bhai <span className="friend-badge">Your Brother</span>
        </div>
        <button className="btn-sos" onClick={() => setSosOpen(true)}>
          🚨 SOS / Nari Shakti
        </button>
      </header>

      {/* SOS Emergency Module (Agent 3) */}
      <AnimatePresence>
        {sosOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sos-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="sos-modal-content"
            >
              <div className="sos-header">
                <div style={{ flex: 1 }}>
                  <h2>🚨 {t('kisanbhai.sos.title', { defaultValue: 'Kisan Emergency Hub' })}</h2>
                  <p style={{ color: '#fff', opacity: 0.8, marginTop: '8px', fontSize: '1.1rem' }}>
                    {t('kisanbhai.sos.subtitle', { defaultValue: '200+ Exact, Step-by-Step solutions for rural hardships.' })}
                  </p>
                  <input
                    type="text"
                    placeholder={t('kisanbhai.sos.searchPlaceholder', { defaultValue: 'Search emergency (e.g., Crop Loss, Debt)...' })}
                    className="sos-search"
                  />
                </div>
                <button className="close-btn" onClick={() => setSosOpen(false)}>✕</button>
              </div>

              <div className="sos-grid">
                <div className="sos-card danger">
                  <h3>⚠️ {t('kisanbhai.sos.debtTitle', { defaultValue: 'Debt & Stress' })}</h3>
                  <p>{t('kisanbhai.sos.debtText', { defaultValue: 'Kisan Mitra Helpline is available 24/7. Your life is precious.' })}</p>
                  <button className="btn-call">📞 {t('kisanbhai.sos.callBtn', { defaultValue: 'Call 14446 Now' })}</button>
                </div>

                <div className="sos-card warning">
                  <h3>🍂 {t('kisanbhai.sos.failureTitle', { defaultValue: 'Crop Failure Protocol' })}</h3>
                  <p><strong>Step 1:</strong> {t('kisanbhai.sos.failureStep1', { defaultValue: 'Take 3 geotagged photos.' })}<br /><strong>Step 2:</strong> {t('kisanbhai.sos.failureStep2', { defaultValue: 'Notify bank/insurance in 72h.' })}</p>
                  <button className="btn-action">{t('kisanbhai.sos.viewBtn', { defaultValue: 'View Full Protocol' })}</button>
                </div>

                <div className="sos-card safe">
                  <h3>🏦 {t('kisanbhai.sos.harassmentTitle', { defaultValue: 'Bank Harassment' })}</h3>
                  <p>{t('kisanbhai.sos.harassmentText', { defaultValue: 'RBI Restructuring mandate & Ombudsman complaint guide.' })}</p>
                  <button className="btn-action">{t('kisanbhai.sos.viewLegal', { defaultValue: 'Legal Defense' })}</button>
                </div>

                <div className="sos-card nari-shakti">
                  <h3>🌺 {t('kisanbhai.sos.nariTitle', { defaultValue: 'Nari Shakti (Women Farmers)' })}</h3>
                  <p>{t('kisanbhai.sos.nariText', { defaultValue: 'Dedicated support for the backbone of Indian farming.' })}</p>
                  <button className="btn-action">{t('kisanbhai.sos.openPortal', { defaultValue: 'Open Nari Portal' })}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The 90-Day Journey Timeline (Agent 1) */}
      <main className="kbhai-main">
        <div className="timeline-scroller">
          {daysArray.map(day => (
            <button
              key={day}
              className={`day-bubble ${activeDay === day ? 'active' : ''} ${day > 10 ? 'locked' : ''}`}
              onClick={() => { if (day <= 10) setActiveDay(day); }}
            >
              {day > 10 ? '🔒' : `Day ${day}`}
            </button>
          ))}
        </div>

        <motion.div 
          key={activeDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="daily-letter-card glass-card"
        >
          <span className="date-tag">Today - Day {activeDay}</span>
          <h2>{t('kisanbhai.daily.greeting', { defaultValue: 'Ram Ram Brother! How is the family doing today?' })}</h2>

          <div className="letter-body">
            <p className="greeting-text">{t('kisanbhai.daily.text1', { defaultValue: "I was just thinking about your field. The soil moisture is perfect right now after yesterday's rain." })}</p>

            <div className="tech-injection">
              <strong>💡 {t('kisanbhai.daily.techTipTitle', { defaultValue: "Today's Agri-Tech Tip:" })}</strong>
              <p>{t('kisanbhai.daily.techTipText', { defaultValue: 'Have you tried intercropping marigolds with your tomatoes? The smell drives away nematodes, saving you ₹1,500 per acre on pesticides.' })}</p>
            </div>

            <div className="scheme-injection">
              <strong>📜 {t('kisanbhai.daily.schemeTitle', { defaultValue: 'Scholarship Alert:' })}</strong>
              <p>{t('kisanbhai.daily.schemeText', { defaultValue: "Did you know your daughter is eligible for the 'Balika Samridhi' educational grant? It covers her entire 10th-grade fees." })}</p>
            </div>

            <blockquote className="motivational-quote">
              "{t('kisanbhai.daily.quote', { defaultValue: 'A farmer works so that the world can sleep peacefully. Stand tall today.' })}"
            </blockquote>

            <p className="closing-text">{t('kisanbhai.daily.closing', { defaultValue: 'Go rest now. I will meet you here tomorrow morning to discuss soil testing limits.' })}</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
