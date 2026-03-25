import React, { useState, useEffect } from 'react';
import './AIVisionBoard.css';

export default function AIVisionBoard() {
    const [step, setStep] = useState(1); // 1: Upload, 2: Loading, 3: Result
    const [exam, setExam] = useState('');
    const [loadingText, setLoadingText] = useState('Initializing AI Core...');

    const exams = [
        { id: 'upsc', name: 'UPSC - IPS Officer', icon: 'uil-shield' },
        { id: 'ias', name: 'UPSC - IAS Officer', icon: 'uil-building' },
        { id: 'nda', name: 'Indian Army (NDA)', icon: 'uil-crosshairs' },
        { id: 'sbi', name: 'SBI Probationary Officer', icon: 'uil-money-bill' },
        { id: 'railway', name: 'Indian Railways', icon: 'uil-train' }
    ];

    const loadingMessages = [
        'Analyzing facial structure...',
        'Synthesizing uniform features...',
        'Applying cultural aesthetics...',
        'Manifesting your future...'
    ];

    const handleGenerate = () => {
        if (!exam) {
            alert("Please select your dream exam first.");
            return;
        }
        setStep(2);
        
        let msgIndex = 0;
        const interval = setInterval(() => {
            msgIndex++;
            if (msgIndex < loadingMessages.length) {
                setLoadingText(loadingMessages[msgIndex]);
            }
        }, 800);

        setTimeout(() => {
            clearInterval(interval);
            setStep(3);
        }, 4000);
    };

    return (
        <section className="vision-board-section" id="vision-board">
            <div className="vision-container">
                
                {/* Header Titles */}
                <div className="vision-header">
                    <div className="vision-badge">AI Powered Preview</div>
                    <h2 className="vision-title">
                        Manifest Your <span>Future Self</span>
                    </h2>
                    <p className="vision-subtitle">
                        Upload your photo and see yourself in the uniform of your dream government job. A powerful vision board to keep you inspired every day.
                    </p>
                </div>

                {/* Main Interactive Platter */}
                <div className="vision-card glass-panel">
                    
                    {/* STEP 1: UPLOAD & SELECT */}
                    {step === 1 && (
                        <div className="vision-step fade-in">
                            <div className="upload-grid">
                                <div className="upload-zone">
                                    <i className="uil uil-cloud-upload upload-icon"></i>
                                    <h3>Upload Your Selfie</h3>
                                    <p>Drop a clear, front-facing photo here</p>
                                    <button className="btn-outline">Browse Files</button>
                                </div>
                                <div className="config-zone">
                                    <h3>Select Your Destiny</h3>
                                    <div className="exam-options">
                                        {exams.map((ex) => (
                                            <div 
                                                key={ex.id} 
                                                className={`exam-option ${exam === ex.id ? 'active' : ''}`}
                                                onClick={() => setExam(ex.id)}
                                            >
                                                <i className={`uil ${ex.icon}`}></i>
                                                {ex.name}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="btn-manifest" onClick={handleGenerate}>
                                        <i className="uil uil-magic"></i> Generate My Vision
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: LOADING */}
                    {step === 2 && (
                        <div className="vision-step text-center fade-in">
                            <div className="ai-loader">
                                <div className="glow-ring"></div>
                                <i className="uil uil-processor"></i>
                            </div>
                            <h3 className="loading-text">{loadingText}</h3>
                            <div className="progress-bar">
                                <div className="progress-fill"></div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: RESULT */}
                    {step === 3 && (
                        <div className="vision-step fade-in">
                            <div className="result-grid">
                                <div className="result-image-wrapper">
                                    <img src="/mock_vision_board.png" alt="Your Future Self" className="result-image" />
                                    <div className="image-overlay">
                                        <span>GovtJobBaba Presents</span>
                                    </div>
                                </div>
                                <div className="result-content">
                                    <h3>Your Destiny Awaits.</h3>
                                    <p className="quote">"The future belongs to those who believe in the beauty of their dreams."</p>
                                    <p className="motivation-text">
                                        This is your manifestation. Save this image, keep it on your desk, and let it drive your preparation every single day. The uniform is waiting for you.
                                    </p>
                                    <div className="result-actions">
                                        <button className="btn-manifest">
                                            <i className="uil uil-download-alt"></i> Download Vision
                                        </button>
                                        <button className="btn-outline" onClick={() => setStep(1)}>
                                            <i className="uil uil-redo"></i> Try Another Exam
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="bg-glow pattern-saffron"></div>
            <div className="bg-glow pattern-green"></div>
        </section>
    );
}
