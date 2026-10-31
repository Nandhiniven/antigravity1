/**
 * AquaGuard - Flood Prediction & Early Warning System
 * Vanilla JavaScript (ES6+) Implementation
 * 
 * Modules:
 * 1. Configuration & Constants
 * 2. State Management & LocalStorage
 * 3. Audio Siren Synthesizer (Web Audio API)
 * 4. Demonstration Risk Scoring Engine & Future Python ML Adapter
 * 5. Chart.js Visualizations (Dual-axis, Doughnut, Forecast, Live Stream)
 * 6. Leaflet OpenStreetMap Integration
 * 7. Live Telemetry Stream Simulation
 * 8. Early Warning Dispatcher & Alert Log
 * 9. UI Navigation, Search, Modals, & Event Handlers
 */

'use strict';

/* ==========================================================================
   1. Configuration & Initial Data
   ========================================================================== */
const CONFIG = {
  // Toggle this to false when connecting to a real Python FastAPI/Flask backend
  USE_MOCK_API: true,
  API_BASE_URL: 'http://localhost:8000/api/v1',
  TELEMETRY_INTERVAL_MS: 4000,
  STORAGE_KEY_ALERTS: 'aquaguard_alerts_v1',
  STORAGE_KEY_AUDIO: 'aquaguard_audio_enabled_v1',
  STORAGE_KEY_PREDICTIONS: 'aquaguard_prediction_history_v1',
};

// Initial River Basins & Sensor Stations Telemetry (Realistic Simulated Data)
const INITIAL_STATIONS = [
  {
    id: 'STN-01',
    name: 'Station Alpha (North River Valley)',
    basin: 'North River Valley',
    lat: 34.0522,
    lng: -118.2437,
    waterLevel: 4.25, // meters
    baselineLevel: 2.10,
    warningLevel: 5.50,
    criticalLevel: 7.20,
    rainfall24h: 68.4, // mm
    prevRainfall: 85.0, // mm
    dischargeFlow: 142.5, // m3/s
    soilSaturation: 68, // %
    temperature: 21.5, // °C
    humidity: 86, // %
    battery: 98,
    status: 'Medium', // Low, Medium, High, Critical
    trend: [3.8, 3.9, 4.0, 4.1, 4.15, 4.2, 4.25],
    lastUpdate: 'Just now'
  },
  {
    id: 'STN-02',
    name: 'Station Bravo (Metro Delta Junction)',
    basin: 'Metro Delta Confluence',
    lat: 34.0150,
    lng: -118.1800,
    waterLevel: 5.92,
    baselineLevel: 2.80,
    warningLevel: 6.00,
    criticalLevel: 7.80,
    rainfall24h: 112.0,
    prevRainfall: 135.0,
    dischargeFlow: 285.0,
    soilSaturation: 84,
    temperature: 22.0,
    humidity: 92,
    battery: 95,
    status: 'High',
    trend: [4.9, 5.1, 5.3, 5.5, 5.7, 5.85, 5.92],
    lastUpdate: 'Just now'
  },
  {
    id: 'STN-03',
    name: 'Station Charlie (East Estuary)',
    basin: 'Coastal Bay Estuary',
    lat: 33.9500,
    lng: -118.1200,
    waterLevel: 2.30,
    baselineLevel: 1.80,
    warningLevel: 4.50,
    criticalLevel: 6.00,
    rainfall24h: 32.5,
    prevRainfall: 42.0,
    dischargeFlow: 68.0,
    soilSaturation: 48,
    temperature: 24.0,
    humidity: 78,
    battery: 100,
    status: 'Low',
    trend: [2.1, 2.15, 2.2, 2.22, 2.25, 2.28, 2.30],
    lastUpdate: 'Just now'
  },
  {
    id: 'STN-04',
    name: 'Station Delta (Highland Gorge Reservoir)',
    basin: 'Highland Mountain Basin',
    lat: 34.1100,
    lng: -118.3100,
    waterLevel: 7.85,
    baselineLevel: 3.50,
    warningLevel: 6.80,
    criticalLevel: 7.50,
    rainfall24h: 174.2,
    prevRainfall: 195.0,
    dischargeFlow: 490.0,
    soilSaturation: 94,
    temperature: 17.5,
    humidity: 98,
    battery: 91,
    status: 'Critical',
    trend: [6.2, 6.6, 7.0, 7.3, 7.55, 7.7, 7.85],
    lastUpdate: 'Just now'
  },
  {
    id: 'STN-05',
    name: 'Station Echo (Pine Ridge Creek)',
    basin: 'Pine Ridge Watershed',
    lat: 34.1500,
    lng: -118.2100,
    waterLevel: 3.10,
    baselineLevel: 1.60,
    warningLevel: 4.80,
    criticalLevel: 6.50,
    rainfall24h: 48.0,
    prevRainfall: 58.0,
    dischargeFlow: 88.5,
    soilSaturation: 59,
    temperature: 19.8,
    humidity: 82,
    battery: 99,
    status: 'Low',
    trend: [2.7, 2.8, 2.85, 2.95, 3.0, 3.05, 3.10],
    lastUpdate: 'Just now'
  },
  {
    id: 'STN-06',
    name: 'Station Foxtrot (South Bay Marshlands)',
    basin: 'South Bay Tidal Marsh',
    lat: 33.9100,
    lng: -118.2800,
    waterLevel: 4.60,
    baselineLevel: 2.20,
    warningLevel: 5.00,
    criticalLevel: 6.80,
    rainfall24h: 76.5,
    prevRainfall: 92.0,
    dischargeFlow: 165.0,
    soilSaturation: 75,
    temperature: 23.2,
    humidity: 89,
    battery: 94,
    status: 'Medium',
    trend: [3.9, 4.1, 4.2, 4.35, 4.45, 4.52, 4.60],
    lastUpdate: 'Just now'
  },
  {
    id: 'STN-07',
    name: 'Station Golf (Western Spillway Dam)',
    basin: 'Central Dam Diversion',
    lat: 34.0800,
    lng: -118.1500,
    waterLevel: 6.40,
    baselineLevel: 3.00,
    warningLevel: 6.20,
    criticalLevel: 8.00,
    rainfall24h: 128.0,
    prevRainfall: 148.0,
    dischargeFlow: 340.0,
    soilSaturation: 86,
    temperature: 20.4,
    humidity: 94,
    battery: 97,
    status: 'High',
    trend: [5.4, 5.6, 5.8, 6.0, 6.15, 6.3, 6.40],
    lastUpdate: 'Just now'
  }
];

// Pre-seeded Initial Emergency Bulletins
const INITIAL_ALERTS = [
  {
    id: 'ALT-9041',
    station: 'Station Delta (Highland Gorge Reservoir)',
    severity: 'Critical',
    title: 'Flash Flood & Spillway Overtopping Warning',
    recommendation: 'Water gauge height has exceeded 7.80m critical stage. Immediate evacuation order for Highland Gorge valley residents within 1.5 miles of river channel.',
    timestamp: '22 minutes ago',
    date: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    status: 'Active'
  },
  {
    id: 'ALT-9040',
    station: 'Station Bravo (Metro Delta Junction)',
    severity: 'High',
    title: 'High Flood Threat & Storm Sewer Backflow Advisory',
    recommendation: 'River stage approaching 6.0m warning stage. Deploy localized sandbag barriers around low-elevation highway underpasses and riverside culverts.',
    timestamp: '1 hour ago',
    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: 'Active'
  },
  {
    id: 'ALT-9039',
    station: 'Station Golf (Western Spillway Dam)',
    severity: 'High',
    title: 'Controlled Sluice Discharge in Effect',
    recommendation: 'Upstream dam gate clearance released at 340 m³/s. Fishermen and recreational boats must steer clear of primary discharge canal.',
    timestamp: '2 hours ago',
    date: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    status: 'Acknowledged'
  },
  {
    id: 'ALT-9038',
    station: 'Station Foxtrot (South Bay Marshlands)',
    severity: 'Medium',
    title: 'High Tide & Runoff Convergence Watch',
    recommendation: 'Coastal marshlands experiencing elevated pooling during high tide cycle. Monitor minor road water logging.',
    timestamp: '5 hours ago',
    date: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    status: 'Acknowledged'
  }
];

/* ==========================================================================
   2. State Management & LocalStorage
   ========================================================================== */
class AquaGuardState {
  constructor() {
    this.stations = [...INITIAL_STATIONS];
    this.alerts = this.loadAlerts();
    this.audioEnabled = this.loadAudioSetting();
    this.activeView = 'home';
    this.isStreaming = true;
    this.streamIntervalId = null;
    this.selectedStationId = 'STN-01';
    this.leafletMap = null;
    this.mapMarkers = [];
    this.activeMapFilter = 'all';
    this.activeAlertFilter = 'all';
    this.viewMode = 'grid'; // 'grid' | 'table'
    this.charts = {};
  }

  loadAlerts() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY_ALERTS);
      return stored ? JSON.parse(stored) : [...INITIAL_ALERTS];
    } catch (e) {
      console.warn('LocalStorage not available, using defaults', e);
      return [...INITIAL_ALERTS];
    }
  }

  saveAlerts() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY_ALERTS, JSON.stringify(this.alerts));
    } catch (e) {
      console.warn('Failed saving alerts to localStorage', e);
    }
  }

  loadAudioSetting() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY_AUDIO);
      return stored !== null ? JSON.parse(stored) : true;
    } catch (e) {
      return true;
    }
  }

  saveAudioSetting(enabled) {
    this.audioEnabled = enabled;
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY_AUDIO, JSON.stringify(enabled));
    } catch (e) {
      console.warn('Failed saving audio setting', e);
    }
  }

  addAlert(newAlert) {
    this.alerts.unshift(newAlert);
    this.saveAlerts();
  }

  updateAlertStatus(alertId, newStatus) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = newStatus;
      this.saveAlerts();
    }
  }
}

const state = new AquaGuardState();

/* ==========================================================================
   3. Synthetic Emergency Siren Audio Engine (Web Audio API)
   ========================================================================== */
class AudioAlertEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  playWarningChime(severity = 'Critical') {
    if (!state.audioEnabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (severity === 'Critical') {
        // High urgency 2-tone warble (880Hz / 660Hz)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(660, now + 0.15);
        osc.frequency.setValueAtTime(880, now + 0.30);
        osc.frequency.setValueAtTime(660, now + 0.45);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.start(now);
        osc.stop(now + 0.65);
      } else {
        // Gentle informational chime (523Hz -> 659Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (err) {
      console.warn('Web Audio playback error:', err);
    }
  }
}

const audioEngine = new AudioAlertEngine();

/* ==========================================================================
   4. Demonstration Risk Scoring Engine & Future Python ML Adapter
   ========================================================================== */
const FloodPredictionService = {
  /**
   * Main prediction entrypoint.
   * If CONFIG.USE_MOCK_API is true, runs the transparent local algorithmic model.
   * Otherwise, sends a REST fetch request to Python FastAPI/Flask backend.
   */
  async predictRisk(inputData) {
    if (CONFIG.USE_MOCK_API) {
      // Small simulated latency to reflect computational pipeline
      await new Promise(resolve => setTimeout(resolve, 350));
      return this.computeDemonstrationRisk(inputData);
    } else {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputData)
        });
        if (!response.ok) {
          throw new Error(`API returned HTTP ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.error('Python ML Backend offline, falling back to local model:', err);
        showToast('ML Backend offline, using local simulation model.', 'warning');
        return this.computeDemonstrationRisk(inputData);
      }
    }
  },

  /**
   * Transparent Demonstration Risk-Scoring Algorithm:
   * Multi-Factor Normalized Weighted Hydrological Index
   */
  computeDemonstrationRisk(inputs) {
    const {
      rainfall,          // 24h Rainfall in mm
      waterLevel,        // River stage in meters
      prevRainfall,      // 3-day antecedent rainfall in mm
      soilSaturation,    // Soil Saturation in % (0 - 100)
      temperature,       // Ambient temp in °C
      humidity,          // Humidity in %
      drainageFactor = 1.15 // Infrastructure condition factor
    } = inputs;

    // 1. Water Level Normalized Index (35% weight)
    // Critical bank-full baseline assumed at 7.5 meters
    const waterRatio = Math.min(100, (waterLevel / 7.5) * 100);
    const waterScore = waterRatio * 0.35;

    // 2. 24h Rainfall Intensity Index (30% weight)
    // Flash flood trigger threshold assumed at 160 mm
    const rainRatio = Math.min(100, (rainfall / 160) * 100);
    const rainScore = rainRatio * 0.30;

    // 3. Antecedent 3-Day Moisture Index (15% weight)
    // 220 mm antecedent moisture represents near saturated basin capacity
    const prevRatio = Math.min(100, (prevRainfall / 220) * 100);
    const prevScore = prevRatio * 0.15;

    // 4. Soil Saturation Index (12% weight)
    const soilRatio = Math.min(100, Math.max(0, soilSaturation));
    const soilScore = soilRatio * 0.12;

    // 5. Atmospheric Index (8% weight)
    // High humidity combined with moderate temperature retards evaporation
    const atmosRatio = Math.min(100, (humidity * 0.7) + Math.max(0, (32 - temperature) * 1.5));
    const atmosScore = atmosRatio * 0.08;

    // Base Composite Score (0 - 100)
    let rawScore = (waterScore + rainScore + prevScore + soilScore + atmosScore) * parseFloat(drainageFactor);
    let finalScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));

    // Determine Risk Classification & Recommendations
    let riskLevel = 'Low';
    let headline = 'Normal River Conditions';
    let description = 'Hydrological indicators are well within safe absorption capacity. Low likelihood of overland flooding.';
    let leadTime = '> 48 Hours';
    let recommendations = [
      'Maintain standard hydrological sensor polling cycles.',
      'Check culverts and storm drains for normal debris clearance.',
      'No immediate civil defense or evacuation actions required.'
    ];

    if (finalScore >= 80) {
      riskLevel = 'Critical';
      headline = 'CRITICAL FLASH FLOOD SURGE IMMINENT';
      description = 'Severe runoff saturation. River stages approaching or exceeding bank-full flood capacity. High velocity inundation expected.';
      leadTime = '< 4 - 8 Hours';
      recommendations = [
        'EXECUTE IMMEDIATE EVACUATION orders for low-lying floodplain sectors.',
        'Sound municipal siren warning systems and broadcast automated SMS alerts.',
        'Dispatch emergency search & rescue teams to designated staging points.',
        'Cut primary power to substations in floodway corridors to prevent electrical hazards.'
      ];
    } else if (finalScore >= 60) {
      riskLevel = 'High';
      headline = 'FLOOD THREAT WATCH & ADVISORY';
      description = 'Watershed moisture capacity exceeded. Rapid river rise anticipated with continued precipitation.';
      leadTime = '8 - 18 Hours';
      recommendations = [
        'Place community disaster response teams and emergency medical units on standby.',
        'Deploy temporary flood barriers and sandbag dikes at vulnerable river embankments.',
        'Warn residents to move vehicles and ground-floor valuables to elevated terrain.',
        'Close low-water bridges and flood-prone underpasses to vehicular traffic.'
      ];
    } else if (finalScore >= 35) {
      riskLevel = 'Medium';
      headline = 'HYDROLOGICAL ADVISORY & MONITORING';
      description = 'Elevated soil moisture and moderate river swell. Localized pooling in poorly drained areas possible.';
      leadTime = '18 - 36 Hours';
      recommendations = [
        'Increase sensor telemetry polling to 2-minute high-frequency mode.',
        'Inspect weir gates, retention ponds, and pump station operational readiness.',
        'Advise outdoor recreational facilities and agricultural riverside sectors to monitor alerts.'
      ];
    }

    // Runoff ratio estimation
    const runoffRatio = Math.min(0.95, Math.max(0.15, (soilSaturation / 100 * 0.6) + (rainfall / 250 * 0.4))).toFixed(2);

    return {
      riskScore: finalScore,
      riskLevel,
      headline,
      description,
      leadTime,
      runoffRatio,
      confidence: (92.5 + (finalScore % 5.5)).toFixed(1) + '%',
      contributions: {
        water: Math.round((waterScore / Math.max(1, rawScore)) * 100) || 35,
        rain: Math.round((rainScore / Math.max(1, rawScore)) * 100) || 30,
        prevRain: Math.round((prevScore / Math.max(1, rawScore)) * 100) || 15,
        soil: Math.round((soilScore / Math.max(1, rawScore)) * 100) || 20
      },
      recommendations
    };
  }
};

/* ==========================================================================
   5. Chart.js Data Visualizations
   ========================================================================== */
const ChartManager = {
  charts: {},

  initAllCharts() {
    this.initDashboardCharts();
    this.initLiveStreamChart();
  },

  initDashboardCharts() {
    // 1. Dual-Axis 24h Rainfall vs Water Level Chart
    const trendCtx = document.getElementById('rainfallWaterChart');
    if (trendCtx) {
      const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
      const rainData = [12, 18, 45, 62, 78, 55, 38, 24];
      const waterData = [2.8, 3.1, 3.6, 4.2, 4.9, 5.2, 5.1, 4.8];

      if (this.charts.rainfallWater) this.charts.rainfallWater.destroy();

      this.charts.rainfallWater = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: hours,
          datasets: [
            {
              label: 'River Water Level (m)',
              data: waterData,
              borderColor: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              yAxisID: 'yWater',
              pointBackgroundColor: '#0284c7',
              pointRadius: 4
            },
            {
              label: 'Hourly Rainfall (mm)',
              data: rainData,
              type: 'bar',
              backgroundColor: 'rgba(56, 189, 248, 0.45)',
              borderColor: '#38bdf8',
              borderWidth: 1,
              borderRadius: 4,
              yAxisID: 'yRain'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 14, font: { family: 'Plus Jakarta Sans', weight: '600' } } },
            tooltip: {
              backgroundColor: '#0a192f',
              titleFont: { family: 'Plus Jakarta Sans' },
              bodyFont: { family: 'Plus Jakarta Sans' }
            }
          },
          scales: {
            x: { grid: { color: '#f1f5f9' } },
            yWater: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Water Level (meters)', color: '#0284c7', font: { weight: '600' } },
              min: 0,
              max: 9,
              grid: { color: '#e2e8f0' }
            },
            yRain: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Rainfall (mm)', color: '#38bdf8', font: { weight: '600' } },
              min: 0,
              max: 100,
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    }

    // 2. Regional Basin Risk Distribution Doughnut Chart
    const distCtx = document.getElementById('riskDistributionChart');
    if (distCtx) {
      if (this.charts.riskDistribution) this.charts.riskDistribution.destroy();

      const counts = this.calculateRiskCounts();

      this.charts.riskDistribution = new Chart(distCtx, {
        type: 'doughnut',
        data: {
          labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
          datasets: [{
            data: [counts.Low, counts.Medium, counts.High, counts.Critical],
            backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, padding: 16, font: { family: 'Plus Jakarta Sans', weight: '600' } }
            }
          },
          cutout: '68%'
        }
      });
    }

    // 3. 7-Day Rainfall Forecast & Runoff Threat Chart
    const forecastCtx = document.getElementById('forecastRunoffChart');
    if (forecastCtx) {
      if (this.charts.forecastRunoff) this.charts.forecastRunoff.destroy();

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const rainForecast = [35, 82, 115, 68, 25, 14, 8];
      const runoffThreat = [30, 65, 88, 70, 35, 20, 15]; // index 0-100

      this.charts.forecastRunoff = new Chart(forecastCtx, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [
            {
              label: 'Predicted Rain (mm)',
              data: rainForecast,
              backgroundColor: '#38bdf8',
              borderRadius: 6,
              yAxisID: 'yRain'
            },
            {
              label: 'Runoff Threat Index (0-100)',
              data: runoffThreat,
              type: 'line',
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              borderWidth: 2.5,
              tension: 0.3,
              pointRadius: 4,
              yAxisID: 'yRunoff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { color: '#f1f5f9' } },
            yRain: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Rain (mm)' },
              grid: { color: '#e2e8f0' }
            },
            yRunoff: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Threat Score' },
              min: 0,
              max: 100,
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    }
  },

  initLiveStreamChart() {
    const liveCtx = document.getElementById('liveTelemetryStreamChart');
    if (liveCtx) {
      if (this.charts.liveStream) this.charts.liveStream.destroy();

      const labels = ['T-24s', 'T-20s', 'T-16s', 'T-12s', 'T-8s', 'T-4s', 'Now'];
      const initialData = [4.15, 4.18, 4.22, 4.21, 4.24, 4.23, 4.25];

      this.charts.liveStream = new Chart(liveCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Station Alpha Live Gauge (m)',
            data: initialData,
            borderColor: '#00b4d8',
            backgroundColor: 'rgba(0, 180, 216, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.25,
            pointRadius: 5,
            pointBackgroundColor: '#00b4d8'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          scales: {
            x: { grid: { color: '#f1f5f9' } },
            y: {
              min: 2,
              max: 9,
              title: { display: true, text: 'Gauge Height (m)' },
              grid: { color: '#e2e8f0' }
            }
          }
        }
      });
    }
  },

  calculateRiskCounts() {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    state.stations.forEach(stn => {
      if (counts[stn.status] !== undefined) {
        counts[stn.status]++;
      }
    });
    return counts;
  },

  updateDistributionChart() {
    if (this.charts.riskDistribution) {
      const counts = this.calculateRiskCounts();
      this.charts.riskDistribution.data.datasets[0].data = [
        counts.Low,
        counts.Medium,
        counts.High,
        counts.Critical
      ];
      this.charts.riskDistribution.update();
    }
  },

  updateLiveStream(newVal) {
    if (this.charts.liveStream) {
      const data = this.charts.liveStream.data.datasets[0].data;
      data.shift();
      data.push(newVal);
      this.charts.liveStream.update();
    }
  }
};

/* ==========================================================================
   6. Leaflet OpenStreetMap Integration
   ========================================================================== */
const MapManager = {
  initMap() {
    const mapElement = document.getElementById('floodRiskLeafletMap');
    if (!mapElement || state.leafletMap) return;

    // Center map around metropolitan river basin cluster
    state.leafletMap = L.map('floodRiskLeafletMap', {
      center: [34.0450, -118.2200],
      zoom: 11,
      zoomControl: true
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | AquaGuard HydroPredict',
      maxZoom: 18
    }).addTo(state.leafletMap);

    this.renderMarkers();
  },

  renderMarkers(filter = 'all') {
    if (!state.leafletMap) return;

    // Remove existing markers
    state.mapMarkers.forEach(m => state.leafletMap.removeLayer(m));
    state.mapMarkers = [];

    const filtered = filter === 'all' 
      ? state.stations 
      : state.stations.filter(s => s.status.toLowerCase() === filter.toLowerCase());

    filtered.forEach(station => {
      const markerHtml = `
        <div class="custom-station-marker">
          <div class="marker-pin marker-${station.status.toLowerCase()}">
            <i class="fa-solid fa-water"></i>
            ${station.status === 'Critical' || station.status === 'High' ? '<div class="marker-pulse-ring"></div>' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 210px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="color: #0f2744; font-size: 0.95rem;">${station.name}</strong>
          </div>
          <div style="font-size: 0.78rem; color: #64748b; margin-bottom: 8px;">Basin: ${station.basin}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.8rem; margin-bottom: 10px;">
            <div style="background: #f8fafc; padding: 4px 6px; border-radius: 4px;">
              <span style="color: #64748b; display: block; font-size: 0.7rem;">Water Level</span>
              <strong style="color: #0f2744;">${station.waterLevel.toFixed(2)} m</strong>
            </div>
            <div style="background: #f8fafc; padding: 4px 6px; border-radius: 4px;">
              <span style="color: #64748b; display: block; font-size: 0.7rem;">24h Rain</span>
              <strong style="color: #0284c7;">${station.rainfall24h.toFixed(1)} mm</strong>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="badge badge-${station.status === 'Critical' ? 'danger' : station.status === 'High' ? 'warning' : station.status === 'Medium' ? 'warning' : 'success'}">${station.status} Risk</span>
            <button onclick="window.preloadPredictionStation('${station.name}')" style="background: #0284c7; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">
              Test Model &rarr;
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([station.lat, station.lng], { icon: customIcon })
        .addTo(state.leafletMap)
        .bindPopup(popupContent);

      marker.on('click', () => {
        this.updateFloatingPanel(station);
      });

      state.mapMarkers.push(marker);
    });
  },

  updateFloatingPanel(station) {
    const title = document.getElementById('panelStationTitle');
    const body = document.getElementById('panelStationBody');
    if (title && body) {
      title.innerText = station.name;
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between;">
            <span class="text-muted">Water Gauge Stage:</span>
            <strong>${station.waterLevel.toFixed(2)} meters</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-muted">Critical Limit:</span>
            <span class="text-danger font-weight-bold">${station.criticalLevel} m</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-muted">24h Precipitation:</span>
            <strong>${station.rainfall24h.toFixed(1)} mm</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-muted">Current Discharge:</span>
            <strong>${station.dischargeFlow} m³/s</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-muted">Soil Saturation:</span>
            <strong>${station.soilSaturation}%</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px;">
            <span class="text-muted">Risk Status:</span>
            <span class="badge badge-${station.status === 'Critical' ? 'danger' : station.status === 'High' ? 'warning' : station.status === 'Medium' ? 'warning' : 'success'}">${station.status}</span>
          </div>
          <button class="btn btn-primary btn-sm w-100 mt-2" onclick="window.preloadPredictionStation('${station.name}')">
            <i class="fa-solid fa-calculator"></i> Run Algorithmic Risk Check
          </button>
        </div>
      `;
    }
  },

  recenter() {
    if (state.leafletMap) {
      state.leafletMap.setView([34.0450, -118.2200], 11);
    }
  },

  invalidateSize() {
    if (state.leafletMap) {
      setTimeout(() => state.leafletMap.invalidateSize(), 200);
    }
  }
};

/* Global hook for map popups */
window.preloadPredictionStation = function(stationName) {
  const station = state.stations.find(s => s.name === stationName);
  if (station) {
    Navigation.navigateTo('prediction');
    const locSelect = document.getElementById('predLocation');
    const rainInput = document.getElementById('predRainfall');
    const waterInput = document.getElementById('predWaterLevel');
    const prevInput = document.getElementById('predPrevRainfall');
    const soilInput = document.getElementById('predSoilSaturation');
    const tempInput = document.getElementById('predTemperature');
    const humInput = document.getElementById('predHumidity');

    if (locSelect) locSelect.value = station.name;
    if (rainInput) rainInput.value = station.rainfall24h;
    if (waterInput) waterInput.value = station.waterLevel;
    if (prevInput) prevInput.value = station.prevRainfall;
    if (soilInput) soilInput.value = station.soilSaturation;
    if (tempInput) tempInput.value = station.temperature;
    if (humInput) humInput.value = station.humidity;

    showToast(`Loaded ${station.name} telemetry into predictor.`, 'info');
  }
};

/* ==========================================================================
   7. Live Telemetry Stream Simulation
   ========================================================================== */
const TelemetryEngine = {
  start() {
    if (state.streamIntervalId) clearInterval(state.streamIntervalId);
    state.isStreaming = true;
    this.updateStreamButtonUI(true);

    state.streamIntervalId = setInterval(() => {
      this.tick();
    }, CONFIG.TELEMETRY_INTERVAL_MS);
  },

  stop() {
    if (state.streamIntervalId) {
      clearInterval(state.streamIntervalId);
      state.streamIntervalId = null;
    }
    state.isStreaming = false;
    this.updateStreamButtonUI(false);
  },

  toggle() {
    if (state.isStreaming) {
      this.stop();
      showToast('Live telemetry auto-streaming paused.', 'warning');
    } else {
      this.start();
      showToast('Live telemetry streaming resumed.', 'success');
    }
  },

  updateStreamButtonUI(isActive) {
    const btn = document.getElementById('toggleLiveStreamBtn');
    const icon = document.getElementById('liveStreamIcon');
    const text = document.getElementById('liveStreamBtnText');
    const badge = document.getElementById('telemetryStreamTimestamp');

    if (btn && icon && text) {
      if (isActive) {
        icon.className = 'fa-solid fa-circle-pause';
        text.innerText = 'Pause Auto-Stream';
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-outline');
      } else {
        icon.className = 'fa-solid fa-circle-play';
        text.innerText = 'Resume Auto-Stream';
        btn.classList.add('btn-warning');
        btn.classList.remove('btn-outline');
      }
    }

    if (badge) {
      badge.innerText = isActive ? `Streaming Active (${new Date().toLocaleTimeString()})` : 'Streaming Paused';
    }
  },

  tick() {
    // Random walk fluctuations across stations
    state.stations.forEach(station => {
      const delta = (Math.random() - 0.48) * 0.08; // slight upward drift
      station.waterLevel = Math.max(1.0, Math.min(10.0, +(station.waterLevel + delta).toFixed(2)));
      
      // Update rainfall slightly
      if (Math.random() > 0.6) {
        station.rainfall24h = +(station.rainfall24h + (Math.random() * 0.4)).toFixed(1);
      }

      // Check threshold recalculation
      if (station.waterLevel >= station.criticalLevel) {
        station.status = 'Critical';
      } else if (station.waterLevel >= station.warningLevel) {
        station.status = 'High';
      } else if (station.waterLevel >= station.baselineLevel + 1.5) {
        station.status = 'Medium';
      } else {
        station.status = 'Low';
      }

      station.lastUpdate = 'Just now';
    });

    // Update Live stream chart with Station Alpha's current reading
    const stnAlpha = state.stations[0];
    if (stnAlpha) {
      ChartManager.updateLiveStream(stnAlpha.waterLevel);
    }

    // Refresh UI components
    UI.renderMonitoringStations();
    UI.renderDashboardTelemetryTable();
    UI.updateDashboardMetrics();
    ChartManager.updateDistributionChart();
  },

  simulateSurge() {
    // Inject sudden rainfall and water level spike
    state.stations.forEach(station => {
      station.waterLevel = +(station.waterLevel + 0.65).toFixed(2);
      station.rainfall24h = +(station.rainfall24h + 24.5).toFixed(1);
      station.soilSaturation = Math.min(100, station.soilSaturation + 8);
      if (station.waterLevel >= station.criticalLevel) {
        station.status = 'Critical';
      } else if (station.waterLevel >= station.warningLevel) {
        station.status = 'High';
      }
    });

    audioEngine.playWarningChime('Critical');
    showToast('Simulated severe rainfall surge injected across all river basins!', 'danger');

    // Auto-generate surge bulletin
    const newAlert = {
      id: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
      station: 'Basin-Wide Meteorological Sensor Grid',
      severity: 'Critical',
      title: 'Sudden Inflow Surge & Runoff Wave Detected',
      recommendation: 'Rapid water level rise detected across multiple monitoring catchments (+0.65m surge). Activate high-alert floodgates and review levee status.',
      timestamp: 'Just now',
      date: new Date().toISOString(),
      status: 'Active'
    };
    state.addAlert(newAlert);
    UI.renderAlerts();
    UI.renderNotifications();

    this.tick();
    MapManager.renderMarkers(state.activeMapFilter);
  }
};

/* ==========================================================================
   8. UI Rendering & Interactions
   ========================================================================== */
const UI = {
  init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    this.populateStationDropdowns();
    this.renderMonitoringStations();
    this.renderDashboardTelemetryTable();
    this.updateDashboardMetrics();
    this.renderAlerts();
    this.renderNotifications();
    this.updateAudioButtonUI();
  },

  updateClock() {
    const clockEl = document.getElementById('headerLiveClock');
    if (clockEl) {
      const now = new Date();
      clockEl.innerText = now.toTimeString().split(' ')[0] + ' UTC' + (now.getTimezoneOffset() <= 0 ? '+' : '-') + Math.abs(now.getTimezoneOffset() / 60);
    }
  },

  populateStationDropdowns() {
    const trendSelect = document.getElementById('trendStationSelect');
    if (trendSelect) {
      trendSelect.innerHTML = state.stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }
  },

  updateDashboardMetrics() {
    const stationsOnline = document.getElementById('homeMetricStations');
    const alertsCount = document.getElementById('homeMetricAlerts');
    const avgWater = document.getElementById('homeMetricAvgWater');
    const maxRain = document.getElementById('homeMetricRainfall');

    if (stationsOnline) stationsOnline.innerText = state.stations.length;
    if (alertsCount) alertsCount.innerText = state.alerts.filter(a => a.status === 'Active').length;

    const avg = (state.stations.reduce((sum, s) => sum + s.waterLevel, 0) / state.stations.length).toFixed(2);
    if (avgWater) avgWater.innerText = `${avg} m`;

    const peak = state.stations.reduce((max, s) => s.rainfall24h > max.rainfall24h ? s : max, state.stations[0]);
    if (maxRain) maxRain.innerText = `${peak.rainfall24h.toFixed(1)} mm`;

    // Dashboard page metrics
    const dashPeak = document.getElementById('dashPeakRain');
    const dashPeakLoc = document.getElementById('dashPeakRainLoc');
    const dashCritical = document.getElementById('dashCriticalCount');
    const dashSaturation = document.getElementById('dashAvgSaturation');

    if (dashPeak) dashPeak.innerText = `${peak.rainfall24h.toFixed(1)} mm`;
    if (dashPeakLoc) dashPeakLoc.innerText = peak.name.split(' (')[0];

    const critCount = state.stations.filter(s => s.status === 'Critical').length;
    if (dashCritical) dashCritical.innerText = `${critCount} / ${state.stations.length}`;

    const avgSat = (state.stations.reduce((sum, s) => sum + s.soilSaturation, 0) / state.stations.length).toFixed(1);
    if (dashSaturation) dashSaturation.innerText = `${avgSat}%`;
  },

  renderDashboardTelemetryTable() {
    const tbody = document.getElementById('dashboardTelemetryTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.stations.slice(0, 5).map(station => {
      const badgeClass = station.status === 'Critical' ? 'badge-danger' : 
                         station.status === 'High' ? 'badge-warning' : 
                         station.status === 'Medium' ? 'badge-warning' : 'badge-success';
      return `
        <tr>
          <td>
            <strong>${station.name}</strong><br>
            <span class="text-muted" style="font-size: 0.74rem;">${station.basin}</span>
          </td>
          <td>
            <strong style="color: #0f2744;">${station.waterLevel.toFixed(2)} m</strong>
            <span class="text-muted" style="font-size: 0.72rem;">/ ${station.criticalLevel}m crit</span>
          </td>
          <td>${station.rainfall24h.toFixed(1)} mm</td>
          <td><span class="badge ${badgeClass}">${station.status}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-cyan" onclick="window.preloadPredictionStation('${station.name}')">
              Predict
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderMonitoringStations() {
    const gridContainer = document.getElementById('stationGridContainer');
    const tableBody = document.getElementById('fullStationTableBody');

    const searchInput = document.getElementById('stationFilterSearch');
    const riskSelect = document.getElementById('stationRiskFilter');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const riskFilter = riskSelect ? riskSelect.value : 'all';

    const filtered = state.stations.filter(s => {
      const matchText = s.name.toLowerCase().includes(query) || s.basin.toLowerCase().includes(query) || s.id.toLowerCase().includes(query);
      const matchRisk = (riskFilter === 'all') || (s.status.toLowerCase() === riskFilter.toLowerCase());
      return matchText && matchRisk;
    });

    // Render Grid
    if (gridContainer) {
      if (filtered.length === 0) {
        gridContainer.innerHTML = `<div class="content-card w-100 text-center py-4"><p class="text-muted">No stations match the selected filter criteria.</p></div>`;
      } else {
        gridContainer.innerHTML = filtered.map(station => {
          const badgeClass = station.status === 'Critical' ? 'badge-danger' : 
                             station.status === 'High' ? 'badge-warning' : 
                             station.status === 'Medium' ? 'badge-warning' : 'badge-success';

          const pct = Math.min(100, Math.round((station.waterLevel / station.criticalLevel) * 100));

          return `
            <div class="station-card">
              <div class="station-card-header">
                <div>
                  <span class="station-id-pill">${station.id}</span>
                  <h4 class="station-name">${station.name}</h4>
                  <span class="station-basin"><i class="fa-solid fa-location-dot"></i> ${station.basin}</span>
                </div>
                <span class="badge ${badgeClass}">${station.status}</span>
              </div>

              <div class="station-gauge-display">
                <div class="gauge-level-meta">
                  <span class="mini-stat-label">Water Gauge Stage</span>
                  <div class="gauge-height-val">${station.waterLevel.toFixed(2)} <span style="font-size: 0.9rem; font-weight: 500;">m</span></div>
                  <span class="gauge-danger-mark">Threshold Limit: <strong>${station.criticalLevel}m</strong></span>
                </div>

                <div class="gauge-tube-graphic" title="Gauge Stage: ${pct}% of critical flood wall">
                  <div class="gauge-tube-water" style="height: ${pct}%;"></div>
                </div>
              </div>

              <div class="station-telemetry-metrics">
                <div class="telemetry-mini-stat">
                  <span class="mini-stat-label">24h Rain</span>
                  <span class="mini-stat-val text-blue">${station.rainfall24h.toFixed(1)} mm</span>
                </div>
                <div class="telemetry-mini-stat">
                  <span class="mini-stat-label">Discharge</span>
                  <span class="mini-stat-val">${station.dischargeFlow} m³/s</span>
                </div>
                <div class="telemetry-mini-stat">
                  <span class="mini-stat-label">Soil Sat.</span>
                  <span class="mini-stat-val">${station.soilSaturation}%</span>
                </div>
              </div>

              <div class="station-card-footer">
                <span class="telemetry-timestamp"><i class="fa-regular fa-clock"></i> Updated ${station.lastUpdate}</span>
                <button class="btn btn-sm btn-outline-cyan" onclick="window.preloadPredictionStation('${station.name}')">
                  <i class="fa-solid fa-chart-line"></i> Predict Risk
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Table View
    if (tableBody) {
      tableBody.innerHTML = filtered.map(station => {
        const badgeClass = station.status === 'Critical' ? 'badge-danger' : 
                           station.status === 'High' ? 'badge-warning' : 
                           station.status === 'Medium' ? 'badge-warning' : 'badge-success';
        return `
          <tr>
            <td><strong>${station.id}</strong> &bull; ${station.name}</td>
            <td>${station.basin}</td>
            <td><strong>${station.waterLevel.toFixed(2)} m</strong></td>
            <td>${station.rainfall24h.toFixed(1)} mm</td>
            <td>${station.dischargeFlow} m³/s</td>
            <td><span class="badge ${badgeClass}">${station.status}</span></td>
            <td><i class="fa-solid fa-battery-three-quarters text-success"></i> ${station.battery}%</td>
            <td>${station.lastUpdate}</td>
            <td>
              <button class="btn btn-sm btn-outline" onclick="window.preloadPredictionStation('${station.name}')">
                Analyze
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  renderAlerts() {
    const listContainer = document.getElementById('alertsHistoryList');
    const sidebarCount = document.getElementById('sidebarAlertCount');
    const notificationBadge = document.getElementById('notificationBadge');

    const activeCount = state.alerts.filter(a => a.status === 'Active').length;
    if (sidebarCount) sidebarCount.innerText = activeCount;
    if (notificationBadge) notificationBadge.innerText = activeCount;

    if (!listContainer) return;

    const filtered = state.activeAlertFilter === 'all' 
      ? state.alerts 
      : state.alerts.filter(a => a.severity.toLowerCase() === state.activeAlertFilter.toLowerCase());

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div class="content-card text-center py-4"><p class="text-muted">No flood alert bulletins found matching this filter.</p></div>`;
      return;
    }

    listContainer.innerHTML = filtered.map(alert => {
      const borderClass = `border-${alert.severity.toLowerCase()}`;
      const badgeClass = alert.severity === 'Critical' ? 'badge-danger' : 
                         alert.severity === 'High' ? 'badge-warning' : 
                         alert.severity === 'Medium' ? 'badge-warning' : 'badge-success';

      const iconBg = alert.severity === 'Critical' ? 'bg-red-soft' : 
                     alert.severity === 'High' ? 'bg-amber-soft' : 'bg-blue-soft';

      const isResolved = alert.status === 'Resolved';
      const isAcknowledged = alert.status === 'Acknowledged';

      return `
        <div class="alert-item-card ${borderClass}">
          <div class="alert-item-left">
            <div class="alert-icon-box ${iconBg}">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <div class="alert-title-row">
                <span class="badge ${badgeClass}">${alert.severity}</span>
                <h5>${alert.title}</h5>
                <span class="badge badge-light" style="font-size: 0.68rem;">${alert.id}</span>
                ${isResolved ? '<span class="badge badge-success">Resolved</span>' : ''}
                ${isAcknowledged && !isResolved ? '<span class="badge badge-info">Acknowledged</span>' : ''}
              </div>
              <p class="alert-item-desc">${alert.recommendation}</p>
              <div class="alert-meta-row">
                <span><i class="fa-solid fa-location-dot"></i> ${alert.station}</span>
                <span><i class="fa-regular fa-clock"></i> ${alert.timestamp}</span>
              </div>
            </div>
          </div>
          <div class="alert-actions-right">
            ${!isResolved ? `
              <button class="btn btn-sm btn-outline" onclick="window.acknowledgeAlert('${alert.id}')" ${isAcknowledged ? 'disabled' : ''}>
                ${isAcknowledged ? '<i class="fa-solid fa-check"></i> Acknowledged' : 'Acknowledge'}
              </button>
              <button class="btn btn-sm btn-outline-cyan" onclick="window.resolveAlert('${alert.id}')">
                Mark Resolved
              </button>
            ` : '<span class="text-muted" style="font-size: 0.8rem;">Archived</span>'}
          </div>
        </div>
      `;
    }).join('');
  },

  renderNotifications() {
    const list = document.getElementById('headerNotificationList');
    if (!list) return;

    const recent = state.alerts.slice(0, 4);
    if (recent.length === 0) {
      list.innerHTML = `<li class="notification-item"><span class="text-muted">No active notifications</span></li>`;
      return;
    }

    list.innerHTML = recent.map(alert => {
      const color = alert.severity === 'Critical' ? 'text-danger' : alert.severity === 'High' ? 'text-warning' : 'text-cyan';
      return `
        <li class="notification-item" onclick="Navigation.navigateTo('warnings')">
          <i class="fa-solid fa-circle-exclamation notification-item-icon ${color}"></i>
          <div class="notification-item-content">
            <div class="notification-item-title">${alert.title}</div>
            <span class="notification-item-time">${alert.timestamp} &bull; ${alert.station.split(' (')[0]}</span>
          </div>
        </li>
      `;
    }).join('');
  },

  updateAudioButtonUI() {
    const icon = document.getElementById('audioToggleIcon');
    const btn = document.getElementById('audioToggleBtn');
    if (icon && btn) {
      if (state.audioEnabled) {
        icon.className = 'fa-solid fa-volume-high text-cyan';
        btn.title = 'Emergency Audio Siren: Enabled';
      } else {
        icon.className = 'fa-solid fa-volume-xmark muted';
        btn.title = 'Emergency Audio Siren: Muted';
      }
    }
  }
};

/* Global hooks for alert cards */
window.acknowledgeAlert = function(id) {
  state.updateAlertStatus(id, 'Acknowledged');
  UI.renderAlerts();
  showToast(`Alert ${id} acknowledged by operator.`, 'info');
};

window.resolveAlert = function(id) {
  state.updateAlertStatus(id, 'Resolved');
  UI.renderAlerts();
  showToast(`Alert ${id} marked as resolved.`, 'success');
};

/* ==========================================================================
   9. Navigation & Router Module
   ========================================================================== */
const Navigation = {
  init() {
    // Hash change listener for SPA routing
    window.addEventListener('hashchange', () => this.handleRouting());

    // Click listeners on sidebar links
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const page = link.getAttribute('data-page');
        if (page) {
          this.navigateTo(page);
        }
      });
    });

    // Feature card click routing on home page
    document.querySelectorAll('[data-navigate]').forEach(card => {
      card.addEventListener('click', () => {
        const target = card.getAttribute('data-navigate');
        if (target) this.navigateTo(target);
      });
    });

    // Mobile Hamburger Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    if (mobileMenuBtn && sidebar && backdrop) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        backdrop.classList.add('active');
      });

      const closeSidebar = () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      };

      if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
      backdrop.addEventListener('click', closeSidebar);
    }

    // Initial page load routing
    this.handleRouting();
  },

  handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'home';
    this.navigateTo(hash, false);
  },

  navigateTo(pageId, updateHash = true) {
    const targetView = document.getElementById(`view-${pageId}`);
    if (!targetView) {
      pageId = 'home';
    }

    // Toggle active view sections
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeView = document.getElementById(`view-${pageId}`);
    if (activeView) activeView.classList.add('active');

    // Update active nav links
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      if (link.getAttribute('data-page') === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Breadcrumb
    const breadcrumb = document.getElementById('currentPageTitle');
    if (breadcrumb) {
      const titles = {
        home: 'Home Overview',
        dashboard: 'Telemetry Dashboard',
        prediction: 'Flood Risk Predictor',
        monitoring: 'Live Basin Telemetry',
        map: 'Geospatial Flood Map',
        warnings: 'Early Warning Center',
        about: 'About & ML Architecture'
      };
      breadcrumb.innerText = titles[pageId] || 'Overview';
    }

    state.activeView = pageId;

    if (updateHash) {
      window.location.hash = pageId;
    }

    // View-specific initializations
    if (pageId === 'map') {
      MapManager.initMap();
      MapManager.invalidateSize();
    } else if (pageId === 'dashboard') {
      setTimeout(() => {
        ChartManager.initDashboardCharts();
      }, 50);
    } else if (pageId === 'monitoring') {
      setTimeout(() => {
        ChartManager.initLiveStreamChart();
      }, 50);
    }

    // Close mobile drawer if open
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

/* ==========================================================================
   10. Event Handlers & User Interactions
   ========================================================================== */
function setupEventListeners() {
  // 1. Audio Siren Toggle Button
  const audioBtn = document.getElementById('audioToggleBtn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      state.saveAudioSetting(!state.audioEnabled);
      UI.updateAudioButtonUI();
      showToast(state.audioEnabled ? 'Audible emergency siren enabled.' : 'Emergency siren muted.', 'info');
      if (state.audioEnabled) {
        audioEngine.playWarningChime('Low');
      }
    });
  }

  // 2. Notification Popover Toggle
  const notifBtn = document.getElementById('notificationBtn');
  const notifPopover = document.getElementById('notificationPopover');
  if (notifBtn && notifPopover) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPopover.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!notifPopover.contains(e.target) && !notifBtn.contains(e.target)) {
        notifPopover.classList.remove('show');
      }
    });
  }

  // Clear all notifications
  const clearAllBtn = document.getElementById('markAllReadBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      state.alerts.forEach(a => a.status = 'Acknowledged');
      state.saveAlerts();
      UI.renderAlerts();
      UI.renderNotifications();
      showToast('All notifications cleared.', 'info');
      if (notifPopover) notifPopover.classList.remove('show');
    });
  }

  // 3. Global Search Input Filter
  const globalSearch = document.getElementById('globalSearchInput');
  const searchDropdown = document.getElementById('searchResultsDropdown');

  if (globalSearch && searchDropdown) {
    globalSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchDropdown.classList.remove('show');
        return;
      }

      const matches = state.stations.filter(s => 
        s.name.toLowerCase().includes(q) || s.basin.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        searchDropdown.innerHTML = `<div class="search-result-item"><span class="text-muted">No matching basins or stations</span></div>`;
      } else {
        searchDropdown.innerHTML = matches.map(s => `
          <div class="search-result-item" onclick="window.preloadPredictionStation('${s.name}'); document.getElementById('searchResultsDropdown').classList.remove('show');">
            <div>
              <strong>${s.name}</strong><br>
              <span class="text-muted" style="font-size: 0.74rem;">${s.basin} &bull; Gauge: ${s.waterLevel}m</span>
            </div>
            <span class="badge badge-${s.status === 'Critical' ? 'danger' : s.status === 'High' ? 'warning' : 'info'}">${s.status}</span>
          </div>
        `).join('');
      }

      searchDropdown.classList.add('show');
    });

    document.addEventListener('click', (e) => {
      if (!globalSearch.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.remove('show');
      }
    });
  }

  // 4. Quick Surge Simulation Buttons
  const surgeBtn1 = document.getElementById('quickSurgeBtn');
  const surgeBtn2 = document.getElementById('simulateSurgeMonitorBtn');
  if (surgeBtn1) surgeBtn1.addEventListener('click', () => TelemetryEngine.simulateSurge());
  if (surgeBtn2) surgeBtn2.addEventListener('click', () => TelemetryEngine.simulateSurge());

  // 5. Dismiss Disclaimer Banner
  const dismissBtn = document.getElementById('dismissBannerBtn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      const banner = document.querySelector('.demo-banner');
      if (banner) banner.style.display = 'none';
    });
  }

  // 6. Live Stream Toggle & Manual Poll
  const toggleStreamBtn = document.getElementById('toggleLiveStreamBtn');
  if (toggleStreamBtn) {
    toggleStreamBtn.addEventListener('click', () => TelemetryEngine.toggle());
  }

  const manualPollBtn = document.getElementById('manualTelemetryRefreshBtn');
  const dashRefreshBtn = document.getElementById('dashboardRefreshBtn');

  const pollAction = () => {
    TelemetryEngine.tick();
    showToast('Hydro-telemetry sensors polled successfully.', 'success');
  };

  if (manualPollBtn) manualPollBtn.addEventListener('click', pollAction);
  if (dashRefreshBtn) dashRefreshBtn.addEventListener('click', pollAction);

  // 7. Grid vs Table Mode Toggle in Live Monitoring
  const gridModeBtn = document.getElementById('viewGridModeBtn');
  const tableModeBtn = document.getElementById('viewTableModeBtn');
  const gridContainer = document.getElementById('stationGridContainer');
  const tableContainer = document.getElementById('stationTableContainer');

  if (gridModeBtn && tableModeBtn && gridContainer && tableContainer) {
    gridModeBtn.addEventListener('click', () => {
      gridModeBtn.classList.add('active');
      tableModeBtn.classList.remove('active');
      gridContainer.classList.remove('hidden');
      tableContainer.classList.add('hidden');
    });

    tableModeBtn.addEventListener('click', () => {
      tableModeBtn.classList.add('active');
      gridModeBtn.classList.remove('active');
      tableContainer.classList.remove('hidden');
      gridContainer.classList.add('hidden');
    });
  }

  // 8. Station Filter Inputs
  const searchStation = document.getElementById('stationFilterSearch');
  const riskSelect = document.getElementById('stationRiskFilter');

  if (searchStation) searchStation.addEventListener('input', () => UI.renderMonitoringStations());
  if (riskSelect) riskSelect.addEventListener('change', () => UI.renderMonitoringStations());

  // 9. Map Filter Pills
  document.querySelectorAll('.map-filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.map-filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.getAttribute('data-map-filter');
      state.activeMapFilter = filter;
      MapManager.renderMarkers(filter);
    });
  });

  const recenterBtn = document.getElementById('resetMapCenterBtn');
  if (recenterBtn) {
    recenterBtn.addEventListener('click', () => MapManager.recenter());
  }

  const closeMapPanelBtn = document.getElementById('closeMapPanelBtn');
  const mapFloatingPanel = document.getElementById('mapFloatingPanel');
  if (closeMapPanelBtn && mapFloatingPanel) {
    closeMapPanelBtn.addEventListener('click', () => {
      mapFloatingPanel.style.display = 'none';
    });
  }

  // 10. Alert History Filter Pills
  document.querySelectorAll('.filter-pill[data-alert-filter]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill[data-alert-filter]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeAlertFilter = pill.getAttribute('data-alert-filter');
      UI.renderAlerts();
    });
  });

  // 11. Siren Test Button in Early Warning
  const testSirenBtn = document.getElementById('triggerEmergencySirenBtn');
  if (testSirenBtn) {
    testSirenBtn.addEventListener('click', () => {
      audioEngine.playWarningChime('Critical');
      showToast('Testing critical flood warning chime.', 'danger');
    });
  }

  // 12. Create Custom Alert Modal Controls
  const openModalBtn = document.getElementById('createNewAlertModalBtn');
  const modal = document.getElementById('customAlertModal');
  const closeModalBtn = document.getElementById('closeAlertModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const customAlertForm = document.getElementById('customAlertForm');

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    const closeModal = () => modal.classList.add('hidden');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    if (customAlertForm) {
      customAlertForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const station = document.getElementById('modalStationSelect').value;
        const severity = document.getElementById('modalSeveritySelect').value;
        const title = document.getElementById('modalAlertHeadline').value;
        const recommendation = document.getElementById('modalAlertRecommendation').value;

        const newAlert = {
          id: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
          station,
          severity,
          title,
          recommendation,
          timestamp: 'Just now',
          date: new Date().toISOString(),
          status: 'Active'
        };

        state.addAlert(newAlert);
        UI.renderAlerts();
        UI.renderNotifications();
        closeModal();
        customAlertForm.reset();

        audioEngine.playWarningChime(severity);
        showToast('Simulated emergency bulletin broadcast successfully!', 'success');
      });
    }
  }

  // 13. Code Tabs Switcher on About Page
  document.querySelectorAll('.code-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.code-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.code-tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });

  // 14. Algorithm Collapsible Toggle
  const algoToggle = document.getElementById('algorithmAccordionToggle');
  const algoBody = document.getElementById('algorithmAccordionBody');
  const algoChevron = document.getElementById('algoChevron');

  if (algoToggle && algoBody && algoChevron) {
    algoToggle.addEventListener('click', () => {
      algoBody.classList.toggle('hidden');
      algoChevron.classList.toggle('rotated');
    });
  }

  // 15. Export CSV & JSON Utilities
  const exportAlertsBtn = document.getElementById('exportAlertsJsonBtn');
  if (exportAlertsBtn) {
    exportAlertsBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.alerts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `aquaguard_alerts_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported alert log to JSON.', 'info');
    });
  }

  const exportCsvBtn = document.getElementById('exportDashboardCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      let csv = 'Station ID,Name,Basin,Water Level (m),Rainfall 24h (mm),Discharge Flow (m3/s),Soil Saturation (%),Risk Status\n';
      state.stations.forEach(s => {
        csv += `"${s.id}","${s.name}","${s.basin}",${s.waterLevel},${s.rainfall24h},${s.dischargeFlow},${s.soilSaturation},"${s.status}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `aquaguard_telemetry_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Exported telemetry dataset to CSV.', 'info');
    });
  }

  // 16. Flood Prediction Form Logic
  setupPredictionForm();
}

/* ==========================================================================
   11. Flood Prediction Form & Result Handler
   ========================================================================== */
function setupPredictionForm() {
  const form = document.getElementById('floodPredictionForm');
  const emptyPlaceholder = document.getElementById('emptyResultPlaceholder');
  const calculatedView = document.getElementById('calculatedResultView');
  const resultCard = document.getElementById('predictionResultCard');

  // Preset Scenario Buttons
  const presetSevereBtn = document.getElementById('loadPresetSevereBtn');
  const presetNormalBtn = document.getElementById('loadPresetNormalBtn');
  const quickTestRunBtn = document.getElementById('quickTestRunBtn');
  const resetFormBtn = document.getElementById('resetPredictionFormBtn');

  const setFormValues = (loc, rain, water, prevRain, soil, temp, hum, drainage = '1.15') => {
    document.getElementById('predLocation').value = loc;
    document.getElementById('predRainfall').value = rain;
    document.getElementById('predWaterLevel').value = water;
    document.getElementById('predPrevRainfall').value = prevRain;
    document.getElementById('predSoilSaturation').value = soil;
    document.getElementById('predTemperature').value = temp;
    document.getElementById('predHumidity').value = hum;
    document.getElementById('predDrainageStatus').value = drainage;
  };

  if (presetSevereBtn) {
    presetSevereBtn.addEventListener('click', () => {
      setFormValues(
        'Station Delta (Highland Gorge Reservoir)',
        175.5, // 24h rain mm
        7.90,  // water level m
        190.0, // prev rain mm
        94,    // soil saturation %
        18.5,  // temp °C
        96,    // humidity %
        '1.35' // constrained drainage
      );
      showToast('Loaded Severe Flash-Flood Scenario.', 'warning');
    });
  }

  if (presetNormalBtn) {
    presetNormalBtn.addEventListener('click', () => {
      setFormValues(
        'Station Charlie (East Estuary)',
        18.0,
        2.20,
        25.0,
        42,
        23.0,
        65,
        '1.0'
      );
      showToast('Loaded Normal Stable Scenario.', 'info');
    });
  }

  if (quickTestRunBtn) {
    quickTestRunBtn.addEventListener('click', () => {
      if (presetSevereBtn) presetSevereBtn.click();
      if (form) form.dispatchEvent(new Event('submit'));
    });
  }

  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      form.reset();
      emptyPlaceholder.classList.remove('hidden');
      calculatedView.classList.add('hidden');
      document.getElementById('riskBadgeStatus').innerText = 'Awaiting Computation';
      document.getElementById('riskBadgeStatus').className = 'badge';
      showToast('Form reset.', 'info');
    });
  }

  // Form Submission & Input Validation
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous validation feedbacks
      document.querySelectorAll('.form-feedback').forEach(el => el.innerText = '');
      document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));

      const location = document.getElementById('predLocation').value;
      const rainfall = parseFloat(document.getElementById('predRainfall').value);
      const waterLevel = parseFloat(document.getElementById('predWaterLevel').value);
      const prevRainfall = parseFloat(document.getElementById('predPrevRainfall').value);
      const soilSaturation = parseFloat(document.getElementById('predSoilSaturation').value);
      const temperature = parseFloat(document.getElementById('predTemperature').value);
      const humidity = parseFloat(document.getElementById('predHumidity').value);
      const drainageFactor = parseFloat(document.getElementById('predDrainageStatus').value);

      let isValid = true;

      // Validation Checks
      if (!location) {
        setFieldError('predLocation', 'feedback-location', 'Please select a monitored basin or target location.');
        isValid = false;
      }
      if (isNaN(rainfall) || rainfall < 0 || rainfall > 600) {
        setFieldError('predRainfall', 'feedback-rainfall', 'Enter a valid rainfall value between 0 and 600 mm.');
        isValid = false;
      }
      if (isNaN(waterLevel) || waterLevel < 0 || waterLevel > 30) {
        setFieldError('predWaterLevel', 'feedback-waterlevel', 'Enter a river gauge height between 0 and 30 meters.');
        isValid = false;
      }
      if (isNaN(prevRainfall) || prevRainfall < 0 || prevRainfall > 800) {
        setFieldError('predPrevRainfall', 'feedback-prevrainfall', 'Enter antecedent rainfall between 0 and 800 mm.');
        isValid = false;
      }
      if (isNaN(soilSaturation) || soilSaturation < 0 || soilSaturation > 100) {
        setFieldError('predSoilSaturation', 'feedback-soilsaturation', 'Soil saturation must be between 0% and 100%.');
        isValid = false;
      }
      if (isNaN(temperature) || temperature < -30 || temperature > 60) {
        setFieldError('predTemperature', 'feedback-temperature', 'Enter ambient temperature between -30°C and 60°C.');
        isValid = false;
      }
      if (isNaN(humidity) || humidity < 0 || humidity > 100) {
        setFieldError('predHumidity', 'feedback-humidity', 'Relative humidity must be between 0% and 100%.');
        isValid = false;
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('predictFloodRiskBtn');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Computing ML Risk Vector...';

      const payload = {
        location,
        rainfall,
        waterLevel,
        prevRainfall,
        soilSaturation,
        temperature,
        humidity,
        drainageFactor
      };

      try {
        const result = await FloodPredictionService.predictRisk(payload);
        renderPredictionResult(result, payload);
      } catch (err) {
        console.error('Prediction failed:', err);
        showToast('Error during risk calculation.', 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
}

function setFieldError(inputId, feedbackId, message) {
  const input = document.getElementById(inputId);
  const feedback = document.getElementById(feedbackId);
  if (input) input.classList.add('is-invalid');
  if (feedback) feedback.innerText = message;
}

function renderPredictionResult(result, inputPayload) {
  const emptyPlaceholder = document.getElementById('emptyResultPlaceholder');
  const calculatedView = document.getElementById('calculatedResultView');
  const resultCard = document.getElementById('predictionResultCard');

  if (emptyPlaceholder) emptyPlaceholder.classList.add('hidden');
  if (calculatedView) calculatedView.classList.remove('hidden');

  // Update Status Badge
  const statusBadge = document.getElementById('riskBadgeStatus');
  const badgeClass = result.riskLevel === 'Critical' ? 'badge-danger' : 
                     result.riskLevel === 'High' ? 'badge-warning' : 
                     result.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success';

  if (statusBadge) {
    statusBadge.innerText = `${result.riskLevel} Risk (${result.riskScore}/100)`;
    statusBadge.className = `badge ${badgeClass}`;
  }

  // Update Result Card Border Color
  if (resultCard) {
    const borderColor = result.riskLevel === 'Critical' ? 'var(--color-critical)' : 
                        result.riskLevel === 'High' ? 'var(--color-high)' : 
                        result.riskLevel === 'Medium' ? 'var(--color-medium)' : 'var(--color-low)';
    resultCard.style.borderTopColor = borderColor;
  }

  // Update Circle Meter Gauge
  const circleFill = document.getElementById('riskCircleFill');
  const scoreValue = document.getElementById('resultScoreValue');
  const riskLevelTag = document.getElementById('resultRiskLevel');
  const headlineEl = document.getElementById('resultRiskHeadline');
  const descEl = document.getElementById('resultRiskDescription');

  if (scoreValue) scoreValue.innerText = result.riskScore;

  if (circleFill) {
    circleFill.setAttribute('stroke-dasharray', `${result.riskScore}, 100`);
    const strokeColor = result.riskLevel === 'Critical' ? '#ef4444' : 
                        result.riskLevel === 'High' ? '#f97316' : 
                        result.riskLevel === 'Medium' ? '#f59e0b' : '#10b981';
    circleFill.style.stroke = strokeColor;
  }

  if (riskLevelTag) {
    riskLevelTag.innerText = `${result.riskLevel} RISK`;
    riskLevelTag.className = `risk-level-tag badge-${result.riskLevel === 'Critical' ? 'danger' : result.riskLevel === 'High' ? 'warning' : result.riskLevel === 'Medium' ? 'warning' : 'success'}`;
  }

  if (headlineEl) headlineEl.innerText = result.headline;
  if (descEl) descEl.innerText = result.description;

  // Key Indices
  const peakEl = document.getElementById('resultTimeToPeak');
  const runoffEl = document.getElementById('resultRunoffRatio');
  const confEl = document.getElementById('resultConfidence');

  if (peakEl) peakEl.innerText = result.leadTime;
  if (runoffEl) runoffEl.innerText = result.runoffRatio;
  if (confEl) confEl.innerText = result.confidence;

  // Contributing factor progress bars
  const barWater = document.getElementById('barFillWater');
  const lblWater = document.getElementById('barLabelWater');
  const barRain = document.getElementById('barFillRain');
  const lblRain = document.getElementById('barLabelRain');
  const barPrevRain = document.getElementById('barFillPrevRain');
  const lblPrevRain = document.getElementById('barLabelPrevRain');
  const barSoil = document.getElementById('barFillSoil');
  const lblSoil = document.getElementById('barLabelSoil');

  if (barWater && lblWater) {
    barWater.style.width = `${result.contributions.water}%`;
    lblWater.innerText = `${result.contributions.water}%`;
  }
  if (barRain && lblRain) {
    barRain.style.width = `${result.contributions.rain}%`;
    lblRain.innerText = `${result.contributions.rain}%`;
  }
  if (barPrevRain && lblPrevRain) {
    barPrevRain.style.width = `${result.contributions.prevRain}%`;
    lblPrevRain.innerText = `${result.contributions.prevRain}%`;
  }
  if (barSoil && lblSoil) {
    barSoil.style.width = `${result.contributions.soil}%`;
    lblSoil.innerText = `${result.contributions.soil}%`;
  }

  // Recommendations Checklist
  const recList = document.getElementById('safetyRecommendationsList');
  if (recList) {
    recList.innerHTML = result.recommendations.map(r => `
      <li>
        <i class="fa-solid fa-circle-check text-cyan" style="margin-top: 3px;"></i>
        <span>${r}</span>
      </li>
    `).join('');
  }

  // Play audio chime if critical/high
  if (result.riskLevel === 'Critical' || result.riskLevel === 'High') {
    audioEngine.playWarningChime(result.riskLevel);
  }

  // Button: Broadcast to Early Warning
  const broadcastBtn = document.getElementById('broadcastPredictionAlertBtn');
  if (broadcastBtn) {
    broadcastBtn.onclick = () => {
      const newAlert = {
        id: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
        station: inputPayload.location,
        severity: result.riskLevel,
        title: `Algorithmic Forecast: ${result.headline}`,
        recommendation: result.recommendations[0] || 'Take precautionary flood avoidance measures.',
        timestamp: 'Just now',
        date: new Date().toISOString(),
        status: 'Active'
      };
      state.addAlert(newAlert);
      UI.renderAlerts();
      UI.renderNotifications();
      showToast('Prediction successfully broadcast to Early Warning log.', 'success');
    };
  }

  // Button: Copy JSON Payload
  const copyJsonBtn = document.getElementById('exportPredictionJsonBtn');
  if (copyJsonBtn) {
    copyJsonBtn.onclick = () => {
      const outputJson = JSON.stringify({ input: inputPayload, output: result }, null, 2);
      navigator.clipboard.writeText(outputJson).then(() => {
        showToast('ML REST payload copied to clipboard!', 'info');
      }).catch(() => {
        showToast('JSON ready in console.', 'info');
        console.log(outputJson);
      });
    };
  }

  showToast(`Prediction computed: ${result.riskLevel} Risk (${result.riskScore}/100)`, result.riskLevel === 'Critical' ? 'danger' : 'info');
}

/* ==========================================================================
   12. Toast Feedback Notification System
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconClass = type === 'danger' ? 'fa-triangle-exclamation text-danger' : 
                    type === 'warning' ? 'fa-circle-exclamation text-warning' : 
                    type === 'success' ? 'fa-circle-check text-success' : 'fa-circle-info text-cyan';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3400);
}

/* ==========================================================================
   13. Application Bootstrap
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
  UI.init();
  ChartManager.initAllCharts();
  TelemetryEngine.start();
  setupEventListeners();

  console.log('%cAquaGuard Flood Prediction & Early Warning System', 'color: #00b4d8; font-size: 16px; font-weight: bold;');
  console.log('%cArchitecture ready for Python Machine Learning backend integration via /api/v1/predict', 'color: #10b981;');
});
