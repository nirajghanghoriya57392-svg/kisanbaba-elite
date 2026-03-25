import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ChevronRight, Settings, Database, AlertCircle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [pin, setPin] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [error, setError] = useState(false);

    const handleLogin = () => {
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
            <div className="admin-auth-container">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="auth-card glass-card"
                >
                    <Shield size={48} className="auth-icon" />
                    <h2>Institutional Access</h2>
                    <p>Enter Master Security PIN to access Mandi Control Hub</p>
                    
                    <div className="pin-input-group">
                        <Lock size={18} />
                        <input 
                            type="password" 
                            placeholder="PIN" 
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ x: -10 }}
                            animate={{ x: 0 }}
                            className="auth-error"
                        >
                            <AlertCircle size={14} /> Invalid Security PIN
                        </motion.div>
                    )}

                    <button className="auth-btn" onClick={handleLogin}>
                        Verify & Enter <ChevronRight size={18} />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="admin-portal-wrapper">
            <header className="admin-portal-header">
                <div className="brand">
                    <Database size={24} />
                    <span>Control Hub v3.0</span>
                </div>
                <div className="status-badge">SYSTEM ACTIVE</div>
            </header>
            
            <main className="admin-portal-grid">
                <section className="portal-apps">
                   <div className="placeholder-card">
                       <Settings size={32} />
                       <h3>Mandi Intelligence Ticker</h3>
                       <p>Real-time manual price overrides and market shock simulations.</p>
                   </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
