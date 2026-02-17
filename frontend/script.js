// ============================================
// Smart Load Distribution Analyzer - Frontend
// ============================================

const API = "https://smart-structure.onrender.com/api/v1";


// State Management
let state = {
  token: localStorage.getItem('token') || '',
  refreshToken: localStorage.getItem('refreshToken') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  surveyId: localStorage.getItem('surveyId') || '',
  buildingId: localStorage.getItem('buildingId') || '',
  surveys: [],
  currentReport: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (state.token && state.user) {
    updateUIAfterLogin();
  }
  loadSurveysIntoDropdown();
});

// ============================================
// UI Helper Functions
// ============================================

function showSection(sectionName) {
  // Check if user is logged in for protected sections
  if (sectionName !== 'auth' && !state.token) {
    showToast('Please login first to access this section', 'error');
    sectionName = 'auth';
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  document.getElementById(`${sectionName}-section`).classList.add('active');
  const navItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
  if (navItem) {
    navItem.classList.add('active');
  }
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  if (tab === 'login') {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
  } else {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'check-circle' : 
               type === 'error' ? 'exclamation-circle' : 
               type === 'warning' ? 'exclamation-triangle' : 'info-circle';
  
  toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function show(data) {
  document.getElementById("output").textContent = JSON.stringify(data, null, 2);
  document.getElementById("console").style.display = 'block';
}

function clearConsole() {
  document.getElementById("output").textContent = '';
  document.getElementById("console").style.display = 'none';
}

function updateUIAfterLogin() {
  document.getElementById('userInfo').style.display = 'flex';
  document.getElementById('userName').textContent = state.user.name;
  showToast(`Welcome back, ${state.user.name}!`, 'success');
  loadSurveysIntoDropdown();
}

// ============================================
// Authentication Functions
// ============================================

async function register() {
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const role = document.getElementById("register-role").value;

  if (!name || !email || !password) {
    showToast('Please fill all fields', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role })
    });

    const data = await res.json();
    show(data);

    if (data.success) {
      showToast('Registration successful! Please login.', 'success');
      switchTab('login');
      document.getElementById('login-email').value = email;
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
    show({ error: err.message });
  }
}

async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showToast('Please enter email and password', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    show(data);

    if (data.success && data.data.token) {
      state.token = data.data.token;
      state.refreshToken = data.data.refreshToken;
      state.user = data.data.user;

      localStorage.setItem('token', state.token);
      localStorage.setItem('refreshToken', state.refreshToken);
      localStorage.setItem('user', JSON.stringify(state.user));

      updateUIAfterLogin();
      showSection('survey');
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
    show({ error: err.message });
  }
}

function logout() {
  state = {
    token: '',
    refreshToken: '',
    user: null,
    surveyId: '',
    buildingId: '',
    surveys: [],
    currentReport: null
  };
  
  localStorage.clear();
  document.getElementById('userInfo').style.display = 'none';
  showSection('auth');
  showToast('Logged out successfully', 'info');
}

// ============================================
// Land Survey Functions
// ============================================

async function createSurvey() {
  if (!state.token) {
    showToast('Please login first', 'error');
    return;
  }

  const surveyData = {
    latitude: parseFloat(document.getElementById("survey-lat").value),
    longitude: parseFloat(document.getElementById("survey-lng").value),
    plotArea: parseFloat(document.getElementById("survey-area").value),
    soilType: document.getElementById("survey-soil").value,
    slope: parseFloat(document.getElementById("survey-slope").value),
    elevation: parseFloat(document.getElementById("survey-elevation").value),
    waterTableDepth: parseFloat(document.getElementById("survey-water").value),
    seismicZone: document.getElementById("survey-seismic").value,
    floodRisk: document.getElementById("survey-flood").value,
    nearbyWaterBodies: document.getElementById("survey-waterbody").value === 'true',
    waterBodyDistance: parseFloat(document.getElementById("survey-waterdist").value) || null,
    averageRainfall: parseFloat(document.getElementById("survey-rainfall").value) || null
  };

  try {
    const res = await fetch(`${API}/land-surveys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + state.token
      },
      body: JSON.stringify(surveyData)
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success' && data.data) {
      state.surveyId = data.data.id;
      localStorage.setItem('surveyId', state.surveyId);
      showToast('Land survey created successfully!', 'success');
      loadSurveys();
      loadSurveysIntoDropdown();
    } else {
      showToast(data.message || 'Failed to create survey', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
    show({ error: err.message });
  }
}

async function loadSurveys() {
  if (!state.token) {
    showToast('Please login first', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/land-surveys`, {
      headers: { Authorization: "Bearer " + state.token }
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success' && data.data) {
      state.surveys = data.data;
      displaySurveys(data.data);
      showToast('Surveys loaded successfully', 'success');
    }
  } catch (err) {
    showToast('Failed to load surveys', 'error');
    show({ error: err.message });
  }
}

function displaySurveys(surveys) {
  const container = document.getElementById('surveys-list');
  
  if (!surveys || surveys.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No surveys found</p></div>';
    return;
  }

  container.innerHTML = surveys.map(survey => `
    <div class="list-item">
      <div class="list-item-header">
        <h4><i class="fas fa-map-marker-alt"></i> Survey ${survey.id.substring(0, 8)}</h4>
        <span class="badge badge-${survey.seismicZone}">${survey.seismicZone}</span>
      </div>
      <div class="list-item-body">
        <p><strong>Location:</strong> ${survey.latitude}, ${survey.longitude}</p>
        <p><strong>Plot Area:</strong> ${survey.plotArea} sq.m</p>
        <p><strong>Soil:</strong> ${survey.soilType}</p>
        <p><strong>Flood Risk:</strong> ${survey.floodRisk}</p>
      </div>
      <div class="list-item-actions">
        <button onclick="selectSurvey('${survey.id}')" class="btn btn-sm btn-primary">
          <i class="fas fa-check"></i> Select
        </button>
      </div>
    </div>
  `).join('');
}

function selectSurvey(surveyId) {
  state.surveyId = surveyId;
  localStorage.setItem('surveyId', surveyId);
  showToast('Survey selected', 'success');
  loadSurveysIntoDropdown();
}

async function loadSurveysIntoDropdown() {
  if (!state.token) return;

  try {
    const res = await fetch(`${API}/land-surveys`, {
      headers: { "Authorization": "Bearer " + state.token }
    });

    const data = await res.json();

    if (data.status === 'success' && data.data) {
      const select = document.getElementById('building-survey');
      select.innerHTML = '<option value="">-- Select Survey --</option>' +
        data.data.map(s => `
          <option value="${s.id}" ${s.id === state.surveyId ? 'selected' : ''}>
            ${s.latitude}, ${s.longitude} - ${s.soilType}
          </option>
        `).join('');
    }
  } catch (err) {
    console.error('Failed to load surveys into dropdown', err);
  }
}

// ============================================
// Building Input Functions
// ============================================

async function createBuilding() {
  if (!state.token) {
    showToast('Please login first', 'error');
    return;
  }

  const selectedSurveyId = document.getElementById('building-survey').value || state.surveyId;
  
  if (!selectedSurveyId) {
    showToast('Please select a land survey first', 'error');
    return;
  }

  const buildingData = {
    landSurveyId: selectedSurveyId,
    buildingType: document.getElementById("building-type").value,
    totalFloors: parseInt(document.getElementById("building-floors").value),
    floorHeight: parseFloat(document.getElementById("building-floorheight").value),
    totalHeight: parseFloat(document.getElementById("building-height").value),
    builtUpArea: parseFloat(document.getElementById("building-area").value),
    orientation: document.getElementById("building-orientation").value,
    structuralSystem: document.getElementById("building-structure").value,
    basementFloors: parseInt(document.getElementById("building-basement").value) || 0,
    parkingFloors: parseInt(document.getElementById("building-parking").value) || 0,
    expectedOccupancy: parseInt(document.getElementById("building-occupancy").value) || null
  };

  try {
    const res = await fetch(`${API}/building-inputs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + state.token
      },
      body: JSON.stringify(buildingData)
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success' && data.data) {
      state.buildingId = data.data.id;
      localStorage.setItem('buildingId', state.buildingId);
      showToast('Building input created successfully!', 'success');
      showSection('wind');
    } else {
      showToast(data.message || 'Failed to create building input', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
    show({ error: err.message });
  }
}

// ============================================
// Wind Data Functions
// ============================================

async function addWind() {
  if (!state.token) {
    showToast('Please login first', 'error');
    return;
  }

  if (!state.buildingId) {
    showToast('Please create a building input first', 'error');
    return;
  }

  const windData = {
    buildingInputId: state.buildingId,
    windDirection: parseFloat(document.getElementById("wind-direction").value),
    averageWindSpeed: parseFloat(document.getElementById("wind-avgspeed").value),
    peakGustSpeed: parseFloat(document.getElementById("wind-peakspeed").value),
    terrainRoughness: document.getElementById("wind-terrain").value
  };

  try {
    const res = await fetch(`${API}/wind`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + state.token
      },
      body: JSON.stringify(windData)
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success') {
      showToast('Wind data added successfully!', 'success');
      showSection('analysis');
    } else {
      showToast(data.message || 'Failed to add wind data', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
    show({ error: err.message });
  }
}

// ============================================
// Analysis Functions
// ============================================

async function runDisaster() {
  if (!state.token) {
    showToast('Please login first', 'error');
    return;
  }

  if (!state.buildingId) {
    showToast('Please create a building input first', 'error');
    return;
  }

  showToast('Running disaster analysis...', 'info');

  try {
    const res = await fetch(`${API}/analysis/disaster/${state.buildingId}`, {
      method: "POST",
      headers: { "Authorization": "Bearer " + state.token }
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success') {
      showToast('Disaster analysis completed!', 'success');
      state.currentReport = data.data;
    } else {
      showToast(data.message || 'Analysis failed', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
    show({ error: err.message });
  }
}

async function runVastu() {
  if (!state.token) {
    showToast('Please login first', 'error');
    return;
  }

  if (!state.buildingId) {
    showToast('Please create a building input first', 'error');
    return;
  }

  showToast('Running Vastu analysis...', 'info');

  try {
    const res = await fetch(`${API}/analysis/vastu/${state.buildingId}`, {
      method: "POST",
      headers: { "Authorization": "Bearer " + state.token }
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success') {
      showToast('Vastu analysis completed!', 'success');
      state.currentReport = data.data;
    } else {
      showToast(data.message || 'Analysis failed', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
    show({ error: err.message });
  }
}

async function generateReport() {
  if (!state.token) {
    showToast('Please login first', 'error');
    return;
  }

  if (!state.buildingId) {
    showToast('Please create a building input first', 'error');
    return;
  }

  showToast('Generating final report...', 'info');

  try {
    const res = await fetch(`${API}/analysis/report/${state.buildingId}`, {
      method: "POST",
      headers: { "Authorization": "Bearer " + state.token }
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success') {
      showToast('Final report generated!', 'success');
      state.currentReport = data.data;
      showSection('reports');
      displayFinalReport(data.data);
    } else {
      showToast(data.message || 'Report generation failed', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
    show({ error: err.message });
  }
}

// ============================================
// Report Viewing Functions
// ============================================

async function viewDisasterReport() {
  if (!state.buildingId) {
    showToast('No building selected', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/analysis/disaster/${state.buildingId}`, {
      headers: { "Authorization": "Bearer " + state.token }
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success') {
      showSection('reports');
      displayDisasterReport(data.data);
    } else {
      showToast('Report not found. Run analysis first.', 'warning');
    }
  } catch (err) {
    showToast('Failed to load report', 'error');
  }
}

async function viewVastuReport() {
  if (!state.buildingId) {
    showToast('No building selected', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/analysis/vastu/${state.buildingId}`, {
      headers: { "Authorization": "Bearer " + state.token }
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success') {
      showSection('reports');
      displayVastuReport(data.data);
    } else {
      showToast('Report not found. Run analysis first.', 'warning');
    }
  } catch (err) {
    showToast('Failed to load report', 'error');
  }
}

async function viewFinalReport() {
  if (!state.buildingId) {
    showToast('No building selected', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/analysis/report/${state.buildingId}`, {
      headers: { "Authorization": "Bearer " + state.token }
    });

    const data = await res.json();
    show(data);

    if (data.status === 'success') {
      showSection('reports');
      displayFinalReport(data.data);
    } else {
      showToast('Report not found. Generate report first.', 'warning');
    }
  } catch (err) {
    showToast('Failed to load report', 'error');
  }
}

function displayDisasterReport(report) {
  const viewer = document.getElementById('report-viewer');
  viewer.innerHTML = `
    <div class="report-header">
      <h2><i class="fas fa-exclamation-triangle"></i> Disaster Analysis Report</h2>
      <div class="report-meta">
        <span><i class="fas fa-calendar"></i> ${new Date(report.createdAt).toLocaleDateString()}</span>
      </div>
    </div>

    <div class="report-section">
      <h3>Load Analysis</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${report.deadLoad.toFixed(2)} kN</div>
          <div class="stat-label">Dead Load</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.liveLoad.toFixed(2)} kN</div>
          <div class="stat-label">Live Load</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.windLoad.toFixed(2)} kN</div>
          <div class="stat-label">Wind Load</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.seismicLoad.toFixed(2)} kN</div>
          <div class="stat-label">Seismic Load</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-value">${report.totalLoad.toFixed(2)} kN</div>
          <div class="stat-label">Total Load</div>
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>Structural Recommendations</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Height Category:</strong> ${report.heightCategory}
        </div>
        <div class="info-item">
          <strong>Foundation Type:</strong> ${report.recommendedFoundation}
        </div>
        <div class="info-item">
          <strong>Foundation Depth:</strong> ${report.foundationDepth}m
        </div>
        <div class="info-item">
          <strong>Column Spacing:</strong> ${report.columnSpacing}m
        </div>
        <div class="info-item">
          <strong>Shear Walls Required:</strong> ${report.shearWallRequired ? 'Yes' : 'No'}
        </div>
      </div>
      <div class="info-box">
        <strong>Beam Sizing:</strong>
        <p>${report.beamSizing}</p>
      </div>
    </div>

    <div class="report-section">
      <h3>Earthquake Analysis</h3>
      <div class="score-card ${getScoreClass(report.earthquakeSafetyScore)}">
        <div class="score-value">${report.earthquakeSafetyScore.toFixed(1)}</div>
        <div class="score-label">Safety Score</div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <strong>Base Shear:</strong> ${report.baseShear.toFixed(2)} kN
        </div>
        <div class="info-item">
          <strong>Soft Story Detected:</strong> 
          <span class="${report.softStoryDetected ? 'text-danger' : 'text-success'}">
            ${report.softStoryDetected ? 'Yes - Critical!' : 'No'}
          </span>
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>Flood Analysis</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Minimum Plinth Height:</strong> ${report.minimumPlinthHeight}m
        </div>
        <div class="info-item">
          <strong>Drainage Slope:</strong> ${report.drainageSlope}%
        </div>
        <div class="info-item">
          <strong>Basement Feasible:</strong> ${report.basementFeasible ? 'Yes' : 'No'}
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>Wind/Cyclone Analysis</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Vortex Shedding Risk:</strong> 
          <span class="badge badge-${report.vortexSheddingRisk.toLowerCase()}">${report.vortexSheddingRisk}</span>
        </div>
        <div class="info-item">
          <strong>Height to Width Ratio:</strong> ${report.heightToWidthRatio.toFixed(2)}
        </div>
      </div>
      <div class="info-box">
        <strong>Shape Optimization:</strong>
        <p>${report.shapeOptimization}</p>
      </div>
    </div>
  `;
}

function displayVastuReport(report) {
  const viewer = document.getElementById('report-viewer');
  viewer.innerHTML = `
    <div class="report-header">
      <h2><i class="fas fa-om"></i> Vastu Shastra Analysis Report</h2>
      <div class="report-meta">
        <span><i class="fas fa-calendar"></i> ${new Date(report.createdAt).toLocaleDateString()}</span>
      </div>
    </div>

    <div class="report-section">
      <h3>Vastu Compliance</h3>
      <div class="score-card ${getScoreClass(report.vastuComplianceScore)}">
        <div class="score-value">${report.vastuComplianceScore.toFixed(1)}</div>
        <div class="score-label">Compliance Score</div>
      </div>
      <div class="info-item">
        <strong>Overall Compliance:</strong> 
        <span class="badge badge-${report.overallCompliance.toLowerCase()}">${report.overallCompliance}</span>
      </div>
    </div>

    <div class="report-section">
      <h3>Directional Analysis</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Entrance Direction:</strong> ${report.entranceDirection}
        </div>
        <div class="info-item">
          <strong>Entrance Suitability:</strong>
          <p class="text-small">${report.entranceSuitability}</p>
        </div>
        <div class="info-item">
          <strong>Kitchen Zone:</strong> ${report.kitchenZoneCompliance ? '✓ Compliant' : '✗ Non-compliant'}
        </div>
        <div class="info-item">
          <strong>Bedroom Zone:</strong> ${report.bedroomZoneCompliance ? '✓ Compliant' : '✗ Non-compliant'}
        </div>
        <div class="info-item">
          <strong>Staircase:</strong> ${report.staircaseCompliance ? '✓ Compliant' : '✗ Non-compliant'}
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>Water Element Placement</h3>
      <div class="info-box">
        <strong>Water Tank Direction:</strong>
        <p>${report.waterTankDirection}</p>
      </div>
      <div class="info-box">
        <strong>Borewell Direction:</strong>
        <p>${report.borewellDirection}</p>
      </div>
    </div>

    <div class="report-section">
      <h3>Wind-Vastu Compatibility</h3>
      <div class="info-box">
        <p>${report.windVastuCompatibility}</p>
      </div>
    </div>

    ${report.violations && report.violations.length > 0 ? `
      <div class="report-section">
        <h3>Violations Detected</h3>
        ${report.violations.map(v => `
          <div class="alert alert-${v.severity.toLowerCase()}">
            <strong>${v.category}:</strong> ${v.description}
            <br><small>Impact: ${v.impact}</small>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${report.corrections && report.corrections.length > 0 ? `
      <div class="report-section">
        <h3>Recommended Corrections</h3>
        ${report.corrections.map(c => `
          <div class="correction-item">
            <div class="correction-header">
              <span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span>
              <strong>${c.violation}</strong>
            </div>
            <p>${c.solution}</p>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function displayFinalReport(report) {
  const viewer = document.getElementById('report-viewer');
  viewer.innerHTML = `
    <div class="report-header">
      <h2><i class="fas fa-file-alt"></i> Comprehensive Analysis Report</h2>
      <div class="report-meta">
        <span><i class="fas fa-calendar"></i> ${new Date(report.generatedAt).toLocaleDateString()}</span>
        <span class="badge badge-success">${report.reportStatus}</span>
      </div>
    </div>

    <div class="report-section">
      <h3>Composite Scores</h3>
      <div class="stats-grid">
        <div class="stat-card ${getScoreClass(report.overallSafetyScore)}">
          <div class="stat-value">${report.overallSafetyScore.toFixed(1)}</div>
          <div class="stat-label">Safety Score</div>
        </div>
        <div class="stat-card ${getScoreClass(report.costEfficiencyScore)}">
          <div class="stat-value">${report.costEfficiencyScore.toFixed(1)}</div>
          <div class="stat-label">Cost Efficiency</div>
        </div>
        <div class="stat-card ${getScoreClass(report.sustainabilityScore)}">
          <div class="stat-value">${report.sustainabilityScore.toFixed(1)}</div>
          <div class="stat-label">Sustainability</div>
        </div>
        <div class="stat-card ${getScoreClass(report.vastuScore)}">
          <div class="stat-value">${report.vastuScore.toFixed(1)}</div>
          <div class="stat-label">Vastu Score</div>
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>Survey Summary</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Location:</strong> ${report.surveySummary.location.lat}, ${report.surveySummary.location.lng}
        </div>
        <div class="info-item">
          <strong>Plot Area:</strong> ${report.surveySummary.plotArea} sq.m
        </div>
        <div class="info-item">
          <strong>Soil Type:</strong> ${report.surveySummary.soilType}
        </div>
        <div class="info-item">
          <strong>Seismic Zone:</strong> ${report.surveySummary.seismicZone}
        </div>
        <div class="info-item">
          <strong>Flood Risk:</strong> ${report.surveySummary.floodRisk}
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>Risk Analysis</h3>
      <div class="risk-cards">
        <div class="risk-card">
          <h4><i class="fas fa-house-damage"></i> Earthquake Risk</h4>
          <p><strong>Zone:</strong> ${report.riskAnalysis.earthquakeRisk.zone}</p>
          <p><strong>Safety Score:</strong> ${report.riskAnalysis.earthquakeRisk.safetyScore}</p>
          <p><strong>Base Shear:</strong> ${report.riskAnalysis.earthquakeRisk.baseShear} kN</p>
        </div>
        <div class="risk-card">
          <h4><i class="fas fa-water"></i> Flood Risk</h4>
          <p><strong>Level:</strong> ${report.riskAnalysis.floodRisk.level}</p>
          <p><strong>Plinth Height:</strong> ${report.riskAnalysis.floodRisk.plinthHeight}m</p>
          <p><strong>Basement:</strong> ${report.riskAnalysis.floodRisk.basementFeasible ? 'Feasible' : 'Not Feasible'}</p>
        </div>
        <div class="risk-card">
          <h4><i class="fas fa-wind"></i> Wind Risk</h4>
          <p><strong>Vortex Shedding:</strong> ${report.riskAnalysis.windRisk.vortexShedding}</p>
          <p><strong>H/W Ratio:</strong> ${report.riskAnalysis.windRisk.heightToWidthRatio}</p>
        </div>
      </div>
    </div>

    <div class="report-section">
      <h3>Final Recommendations</h3>
      
      <div class="recommendations">
        <h4><i class="fas fa-hard-hat"></i> Structural</h4>
        <ul>
          ${report.finalRecommendations.structural.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div class="recommendations">
        <h4><i class="fas fa-exclamation-triangle"></i> Disaster Mitigation</h4>
        <ul>
          ${report.finalRecommendations.disaster.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div class="recommendations">
        <h4><i class="fas fa-om"></i> Vastu</h4>
        <ul>
          ${report.finalRecommendations.vastu.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div class="recommendations">
        <h4><i class="fas fa-info-circle"></i> General</h4>
        <ul>
          ${report.finalRecommendations.general.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

function getScoreClass(score) {
  if (score >= 80) return 'score-excellent';
  if (score >= 60) return 'score-good';
  if (score >= 40) return 'score-moderate';
  return 'score-poor';
}
