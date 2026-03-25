import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ShieldAlert, 
  Lock, 
  Key, 
  Terminal, 
  Database, 
  Settings, 
  Activity,
  ArrowRight
} from 'lucide-react';
import SEO from '../components/SEO';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [error, setError] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuth(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  if (!isAuth) {
    return (
      <div className="admin-gate-container">
        <SEO title="Admin Gateway - KisanBaba" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gate-card glass-card"
        >
          <Lock size={48} color="var(--prosperity-gold)" className="gate-icon" />
          <h2>Command Center Access</h2>
          <p>Please enter Master PIN to unlock institutional controls.</p>
          <form onSubmit={handleAuth}>
            <input 
              type="password" 
              placeholder="••••" 
              maxLength="4"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={error ? 'input-error' : ''}
            />
            <button type="submit">Unlock System <Key size={18} /></button>
          </form>
          {error && <span className="auth-error">Incorrect Authorization Code</span>}
        </motion.div>

        <style dangerouslySetInnerHTML={{ __html: `
          .admin-gate-container {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
          }
          .gate-card {
            max-width: 400px;
            text-align: center;
            padding: 50px;
          }
          .gate-icon { margin-bottom: 20px; }
          .gate-card input {
            width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--glass-border);
            padding: 16px;
            border-radius: 12px;
            color: white;
            font-size: 1.5rem;
            text-align: center;
            letter-spacing: 12px;
            margin: 24px 0 16px;
          }
          .gate-card button {
            width: 100%;
            background: var(--prosperity-gold);
            color: black;
            border: none;
            padding: 16px;
            border-radius: 12px;
            font-weight: 1000;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          .input-error { border-color: #ef4444 !important; }
          .auth-error { color: #ef4444; font-size: 0.8rem; font-weight: 700; margin-top: 12px; display: block; }
        `}} />
      </div>
    );
  }

  return (
    <div className="admin-core">
      <SEO title="Elite Admin Control - KisanBaba" />
      <header className="admin-header">
         <div className="admin-brand"><Terminal size={20} /> ELITE CONTROL v2.0</div>
         <h1>Command Dashboard</h1>
      </header>

      <main className="admin-grid">
         <div className="admin-panel glass-card">
            <h4><Activity size={20} /> System Pulse</h4>
            <div className="pulse-stat">
              <span>Sync Status:</span>
              <strong className="text-green">NASA-IMD ACTIVE</strong>
            </div>
            <div className="pulse-stat">
              <span>Uptime:</span>
              <strong>99.98%</strong>
            </div>
         </div>

         <div className="admin-panel glass-card">
            <h4><Database size={20} /> Data Nodes</h4>
            <div className="pulse-stat">
               <span>Total Records:</span>
               <strong>1.42M</strong>
            </div>
            <button className="panel-action">Flush Cache</button>
         </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-core { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .admin-brand { font-weight: 900; color: var(--prosperity-gold); font-size: 0.8rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .admin-header h1 { font-size: 2.5rem; font-weight: 1000; margin-bottom: 40px; }
        .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .admin-panel h4 { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; font-weight: 950; }
        .pulse-stat { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 700; }
        .text-green { color: var(--nature-green); }
        .panel-action { width: 100%; padding: 12px; margin-top: 20px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; border-radius: 10px; cursor: pointer; font-weight: 800; }
      `}} />
    </div>
  );
};

export default AdminDashboard;
