import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Rss, CloudSun, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './BottomNav.css';

const BottomNav = () => {
  const { t } = useTranslation();
  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/mandi-dashboard', icon: BarChart2, label: t('nav.mandi') },
    { to: '/news-radar', icon: Rss, label: t('nav.news') },
    { to: '/kisan-bhai', icon: Layout, label: t('nav.kisanBhai') },
    { to: '/weather-radar', icon: CloudSun, label: t('nav.kavach') },
  ];

  return (
    <motion.nav 
      className="bottom-nav"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <div className="bottom-nav-content">
        {navItems.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <div className="icon-wrapper">
                  <item.icon size={24} />
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="active-pill"
                      transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                    />
                  )}
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
};


export default BottomNav;
