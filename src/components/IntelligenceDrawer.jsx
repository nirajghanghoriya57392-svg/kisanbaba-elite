import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './IntelligenceDrawer.css';

export default function IntelligenceDrawer({ isOpen, onClose, commodity, localPrice, state, district, trendData }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Mocked AI Pulse Reasoning for the "Pro" experience
  const aiInsights = [
    { agent: "Data Pulse", check: "Arrivals are up 15%", impact: "High" },
    { agent: "Weather Watch", check: "No rain expected", impact: "Safe" },
    { agent: "Prophet v3", check: "30-Day Peak: ₹" + (localPrice * 1.15).toFixed(0), impact: "Hold" }
  ];

  return (
    <div className={`intel-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="intel-drawer-content" onClick={e => e.stopPropagation()}>
        <button className="drawer-close-btn" onClick={onClose}>×</button>
        
        <div className="intel-header">
          <div className="ai-pulse-ring"></div>
          <h2>{t('mandi.pro.intelTitle', { defaultValue: 'Pro Mandi Intelligence' })}</h2>
          <p>{commodity} • {district}, {state}</p>
        </div>

        <div className="intel-scroll-area">
          {/* CACP Break-Even Analysis */}
          <section className="intel-section">
            <h3>📊 {t('mandi.pro.cacpTitle', { defaultValue: 'Economic Intelligence (CACP)' })}</h3>
            <div className="cacp-metrics-grid">
              <div className="cacp-card">
                <span className="label">A2+FL Cost</span>
                <span className="value">₹1,450/q</span>
              </div>
              <div className="cacp-cardHighlight">
                <span className="label">Profit Margin</span>
                <span className="value">+{((localPrice - 1450) / 1450 * 100).toFixed(1)}%</span>
              </div>
            </div>
          </section>

          {/* AI Reasoning Section */}
          <section className="intel-section">
            <h3>🤖 {t('mandi.pro.reasoningTitle', { defaultValue: 'AI Reasoning Pulse' })}</h3>
            <div className="ai-reasoning-list">
              {aiInsights.map((insight, index) => (
                <div key={index} className="ai-reasoning-item">
                  <div className="agent-badge">{insight.agent}</div>
                  <div className="agent-text">{insight.check}</div>
                  <div className={`impact-indicator ${insight.impact.toLowerCase()}`}>{insight.impact}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Weather Risk Section */}
          <section className="intel-section">
            <h3>🌦️ {t('mandi.pro.weatherRisk', { defaultValue: 'Storage & Logistic Risk' })}</h3>
            <div className="weather-risk-card">
              <div className="risk-level low">LOW RISK</div>
              <p>Ideal weather for open transport. No moisture threat to storage for next 5 days.</p>
            </div>
          </section>

          {/* Market Sentiment */}
          <section className="intel-section">
            <h3>💡 {t('mandi.pro.sentiment', { defaultValue: 'Market Sentiment' })}</h3>
            <div className="sentiment-meter">
              <div className="sentiment-fill hold" style={{ width: '75%' }}></div>
              <div className="sentiment-labels">
                <span>Sell</span>
                <span>Hold</span>
                <span>Buy</span>
              </div>
            </div>
          </section>
        </div>

        <div className="intel-footer">
          <button className="action-btn primary" onClick={onClose}>
            {t('mandi.pro.gotIt', { defaultValue: 'Got it, Partner!' })}
          </button>
        </div>
      </div>
    </div>
  );
}
