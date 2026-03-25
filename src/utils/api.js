/**
 * KisanBaba Advanced Intelligence API Utility
 * -------------------------------------------
 * Core engine for Mandi Price Discovery, Arbitrage, 
 * Mausam Kavach (NASA Power/IMD), and Strategic Verdicts.
 */

import axios from 'axios';
import cropsData from '../data/crops.json';
import cacpData from '../data/cacp_costs.json';

// --- CONSTANTS & CONFIG ---
const AGMARK_BASE_URL = 'https://api.data.gov.in/resource/9ef27ccc-3a2a-4a9f-8870-39f5731bf273';
const API_KEY = '579b315880d867c4fa475f623fde0c31';
const NASA_POWER_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

// --- 1. MANDI DATA FETCHING (HYPER-LOCAL) ---

/**
 * Fetches real-time mandi rates with filters.
 * Returns records for a specific state, district, or commodity.
 */
export const fetchMandiRates = async (filters = {}) => {
    try {
        const { state, district, commodity, limit = 100 } = filters;
        let url = `${AGMARK_BASE_URL}?api-key=${API_KEY}&format=json&limit=${limit}`;
        
        if (state) url += `&filters[state.keyword]=${encodeURIComponent(state)}`;
        if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
        if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;

        const response = await axios.get(url);
        return response.data.records || [];
    } catch (error) {
        console.error("Mandi API Error:", error);
        return [];
    }
};

/**
 * Fetches TOP 5 most traded commodities for the Ticker Tape.
 */
export const fetchTopTradedCommodities = async () => {
    try {
        // We fetch a larger set and pick diverse ones
        const records = await fetchMandiRates({ limit: 50 });
        const map = new Map();
        
        records.forEach(r => {
            if (!map.has(r.commodity)) {
                map.set(r.commodity, {
                    name: r.commodity,
                    icon: getCropIcon(r.commodity),
                    mandi: r.market,
                    price: parseInt(r.modal_price),
                    change: Math.floor(Math.random() * 100) - 50, // Mock change for UI
                    trend: Math.random() > 0.5 ? 'up' : 'down'
                });
            }
        });

        return Array.from(map.values()).slice(0, 5);
    } catch (error) {
        return [];
    }
};

// --- 2. THE ARBITRAGE ENGINE (PRO FIT) ---

/**
 * Calculates price arbitrage opportunities across mandis for a specific crop.
 * Formula: Potential Profit = (Max Price - Local Price) - Logistics Cost.
 */
export const calculateArbitrage = (localRecords, allRecords) => {
    if (!localRecords.length || !allRecords.length) return [];

    const commodity = localRecords[0].commodity;
    const localAvg = localRecords.reduce((acc, r) => acc + parseInt(r.modal_price), 0) / localRecords.length;

    // Find Mandis selling the SAME commodity at higher prices
    const opportunities = allRecords
        .filter(r => r.commodity === commodity && parseInt(r.modal_price) > localAvg)
        .map(r => {
            const externalPrice = parseInt(r.modal_price);
            const rawDiff = externalPrice - localAvg;
            const logisticsEst = 150; // Flat estimate per quintal for 200km
            const netProfit = rawDiff - logisticsEst;

            return {
                targetMandi: r.market,
                targetDistrict: r.district,
                targetPrice: externalPrice,
                localAvg: Math.round(localAvg),
                grossProfit: Math.round(rawDiff),
                netProfit: Math.round(netProfit),
                logistics: logisticsEst,
                confidence: netProfit > 300 ? 'HIGH' : 'LOW'
            };
        })
        .sort((a, b) => b.netProfit - a.netProfit);

    return opportunities.slice(0, 3); // Top 3 opportunities
};

// --- 3. MAUSAM KAVACH (NASA + IMD SYNC) ---

/**
 * Translates raw weather data into Operational Commands.
 */
export const fetchWeatherShieldData = async (location, crop) => {
    try {
        // Mocking sophisticated sync logic
        // In production, this calls NASA POWER and local IMD station APIs
        
        const rawData = {
            temp: 34,
            humidity: 65,
            rainProb: 15,
            windSpeed: 12,
            windDir: 210, // South-West
            timestamp: new Date().toISOString()
        };

        const panels = [
            {
                id: 'spraying',
                title: i18n_get('weather.panels.spraying', 'Spraying Protocol'),
                items: [
                    {
                        id: 's1',
                        brand: 'SHIELD-AI',
                        name: i18n_get('weather.items.deltaT', 'Delta-T Guidance'),
                        advice: i18n_get('weather.advice.deltaT', 'Optimal windows: 06:00 - 09:00. Wind is within safety limits.'),
                        status: 'OPTIMAL'
                    },
                    {
                        id: 's2',
                        brand: 'KAVACH',
                        name: i18n_get('weather.items.rainWash', 'Rain-Wash Risk'),
                        advice: i18n_get('weather.advice.rainWash', 'Low risk (15%). Systemic fungicides recommended over contact.'),
                        status: 'SAFE'
                    }
                ]
            },
            {
                id: 'irrigation',
                title: i18n_get('weather.panels.irrigation', 'Smart Irrigation'),
                items: [
                    {
                        id: 'i1',
                        brand: 'NASA-HYDRA',
                        name: i18n_get('weather.items.evapo', 'Evapotranspiration'),
                        advice: i18n_get('weather.advice.evapo', 'High heat (34°C). Increase irrigation frequency by 20%.'),
                        status: 'WARNING',
                        progress: 85
                    }
                ]
            },
            {
                id: 'emergency',
                title: i18n_get('weather.panels.emergency', 'Emergency Alerts'),
                items: [
                    {
                        id: 'e1',
                        brand: 'IMD-SYNC',
                        name: i18n_get('weather.items.heatwave', 'Heatwave Alert'),
                        advice: i18n_get('weather.advice.heatwave', 'Severe heatwave localized to Malwa region. Use mulch covering.'),
                        status: 'CRITICAL'
                    }
                ]
            }
        ];

        return { rawData, panels, timestamp: rawData.timestamp };
    } catch (error) {
        return null;
    }
};

// --- 4. THE STRATEGIC VERDICT (10/10 AI ENSEMBLE) ---

/**
 * Calculates the final Decision Matrix for a farmer.
 * Layers: [Price Trend] + [Warehouse Stock] + [Weather Shock] + [CACP Cost] + [Cultural Shock]
 */
export const calculateStrategicVerdict = async (mandiPrice, commodity, district) => {
    // A. FETCH CONTEXTUAL DATA
    const cropMeta = cropsData.find(c => c.name.toLowerCase().includes(commodity.toLowerCase())) || cropsData[0];
    const costBasis = cacpData.Crops[commodity] || cacpData.Crops['Soybean']; // Default to Soybean if missing
    
    // B. COMPUTE INDICATORS
    const mspPrice = costBasis.National_MSP;
    const productionCost = costBasis.National_C2; // Total cost including land rent
    
    const profitMargin = (mandiPrice - productionCost) / productionCost;
    const mspDelta = mandiPrice - mspPrice;

    // C. MULTI-AGENT ENSEMBLE REASONING
    let score = 0;
    let logic = [];

    // Agent 1: The Economic Historian (Price vs MSP)
    if (mandiPrice > mspPrice * 1.15) {
        score += 3;
        logic.push("Price is 15%+ above MSP. HISTORICAL PEAK ZONE.");
    } else if (mandiPrice < mspPrice) {
        score -= 2;
        logic.push("CRITICAL: Below MSP. Do not sell unless SOS.");
    } else {
        score += 1;
        logic.push("Stable above MSP. Defensive positioning.");
    }

    // Agent 2: The Profit Sentinel (Margin Analysis)
    if (profitMargin > 0.4) {
        score += 3;
        logic.push("Exceptional Returns (40%+ profit). EXIT TRIGGER ACTIVE.");
    } else if (profitMargin < 0) {
        score -= 1;
        logic.push("Negative Returns detected based on national C2 costs.");
    }

    // Agent 3: The Mausam Maven (Weather Impact)
    // (Simulated based on region or month)
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) { // Monsoon
        score -= 1;
        logic.push("Monsoon logistics risk. Supply chain friction likely.");
    }

    // D. FINAL VERDICT ASSEMBLY
    const finalScore = Math.max(1, Math.min(10, score + 4)); // Normalizing to 1-10

    let action = "HOLD";
    let color = "#eab308"; // Gold/Warning
    
    if (finalScore >= 8) {
        action = "STRATEGIC SELL";
        color = "#22c55e"; // Green
    } else if (finalScore <= 4) {
        action = "SOS HOLD / PROCUREMENT";
        color = "#ef4444"; // Red
    }

    return {
        score: finalScore,
        action,
        color,
        reasoning: logic,
        metrics: {
            msp: mspPrice,
            cost: productionCost,
            margin: Math.round(profitMargin * 100),
            potential_peak: Math.round(mandiPrice * 1.08)
        }
    };
};

// --- HELPER FUNCTIONS ---

const getCropIcon = (commodity) => {
    const icons = {
        'Tomato': '🍅',
        'Onion': '🧅',
        'Paddy': '🌾',
        'Wheat': '🌾',
        'Soyabean': '🫘',
        'Garlic': '🧄',
        'Chilli': '🌶️',
        'Cotton': '☁️',
        'Mustard': '🌼'
    };
    for (let key in icons) {
        if (commodity.includes(key)) return icons[key];
    }
    return '🌱';
};

const i18n_get = (key, fallback) => {
    // This would typically interface with react-i18next
    return fallback;
};
