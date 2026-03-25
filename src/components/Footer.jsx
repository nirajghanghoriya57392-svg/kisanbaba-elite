import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Globe, ShieldCheck, MessageCircle, UserCircle, Heart, Info } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="kb-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand-section">
            <div className="footer-logo">
              <Sprout size={32} className="sprout-icon" strokeWidth={3} />
              KisanBaba
            </div>
            <p className="footer-tagline">
              {t('footer.brand_mission', { defaultValue: 'Empowering India\'s farmers through data-driven precision and institutional trust.' })}
            </p>
            <div className="footer-social">
              {/* Optional Social Icons could go here */}
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-group">
              <h4>{t('nav.calculators', { defaultValue: 'Elite Tools' })}</h4>
              <Link to="/mandi-dashboard">{t('nav.mandi', { defaultValue: 'Mandi Dashboard' })}</Link>
              <Link to="/news-radar">{t('nav.news', { defaultValue: 'News Radar' })}</Link>
              <Link to="/kisan-bhai">{t('nav.kisanBhai', { defaultValue: 'Community' })}</Link>
            </div>
            <div className="footer-group">
              <h4>{t('footer.support', { defaultValue: 'Support' })}</h4>
              <a href="#">{t('footer.privacy', { defaultValue: 'Privacy Policy' })}</a>
              <a href="#">{t('footer.contact', { defaultValue: 'Contact Support' })}</a>
              <Link to="/admin" className="admin-link">{t('footer.admin', { defaultValue: 'Institutional Login' })}</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-info">
            <Info size={14} />
            <span>{t('footer.disclaimer', { defaultValue: 'Institutional Grade Data. Market prices subject to auction dynamics.' })}</span>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} KisanBaba Smart Agriculture. {t('footer.rights', { defaultValue: 'All Rights Reserved.' })}
          </div>
        </div>
      </div>
    </footer>
  );
}
