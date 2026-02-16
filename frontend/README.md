# Smart Load Distribution Analyzer - Frontend

## Overview

A modern, responsive frontend for the Smart Load Distribution Analyzer platform. Built with vanilla JavaScript, HTML5, and CSS3 for maximum compatibility and performance.

## Features

### 🔐 Authentication
- User registration with role selection
- Secure login with JWT tokens
- Token persistence with localStorage
- Automatic session management

### 🗺️ Land Survey Management
- Create detailed land surveys
- View all surveys in a list
- Select surveys for building analysis
- Real-time form validation

### 🏢 Building Input
- Comprehensive building specifications
- Multiple building types support
- Structural system selection
- Orientation and floor configuration

### 💨 Wind Data Analysis
- Wind direction and speed input
- Terrain roughness selection
- Automatic wind load calculations
- IS 875 Part 3 compliant

### 📊 Analysis Dashboard
- Disaster analysis (Earthquake, Flood, Cyclone)
- Vastu Shastra compliance check
- Final comprehensive report generation
- Real-time analysis status

### 📄 Report Viewer
- Beautiful report visualization
- Color-coded scores and ratings
- Detailed recommendations
- Risk assessment breakdown

## File Structure

```
frontend/
├── index.html          # Main HTML structure
├── script.js           # JavaScript logic and API calls
├── style.css           # Complete styling
└── README.md           # This file
```

## Setup

### 1. Prerequisites

- Backend server running on `http://localhost:5000`
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 2. Configuration

Update the API endpoint in `script.js` if needed:

```javascript
const API = "http://localhost:5000/api/v1";
```

### 3. Running the Frontend

#### Option 1: Simple HTTP Server (Python)

```bash
cd frontend
python -m http.server 8080
```

Then open: `http://localhost:8080`

#### Option 2: Node.js HTTP Server

```bash
cd frontend
npx http-server -p 8080
```

Then open: `http://localhost:8080`

#### Option 3: VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

#### Option 4: Direct File Access

Simply open `index.html` in your browser (some features may be limited due to CORS)

## Usage Guide

### Step 1: Authentication

1. Click "Register" tab
2. Fill in your details:
   - Full Name
   - Email
   - Password (min 8 characters)
   - Role (User/Engineer)
3. Click "Register"
4. Switch to "Login" tab
5. Enter email and password
6. Click "Login"

### Step 2: Create Land Survey

1. Navigate to "Land Survey" section
2. Fill in all survey details:
   - Location (Latitude/Longitude)
   - Plot area
   - Soil type
   - Seismic zone
   - Flood risk
   - Water table depth
   - etc.
3. Click "Create Land Survey"
4. View your surveys in the list below

### Step 3: Create Building Input

1. Navigate to "Building Input" section
2. Select a land survey from dropdown
3. Fill in building specifications:
   - Building type
   - Number of floors
   - Floor height
   - Orientation
   - Structural system
   - etc.
4. Click "Create Building Input"

### Step 4: Add Wind Data

1. Navigate to "Wind Data" section
2. Enter wind parameters:
   - Wind direction (0-360 degrees)
   - Average wind speed
   - Peak gust speed
   - Terrain roughness
3. Click "Add Wind Data"

### Step 5: Run Analysis

1. Navigate to "Analysis" section
2. Click "Run Analysis" on:
   - Disaster Analysis (Earthquake, Flood, Cyclone)
   - Vastu Analysis (Vastu Shastra compliance)
3. Click "View Report" to see results

### Step 6: Generate Final Report

1. In "Analysis" section
2. Click "Generate Report" on Final Report card
3. View comprehensive report with all analyses

## Features Breakdown

### UI Components

#### Navigation
- Sidebar navigation with icons
- Active state highlighting
- Smooth section transitions

#### Forms
- Tabbed interface for auth
- Grid layout for multi-field forms
- Real-time validation
- Dropdown selects for enums

#### Cards
- Analysis cards with icons
- List items for surveys
- Report sections
- Score cards with color coding

#### Notifications
- Toast notifications for actions
- Success/Error/Warning/Info states
- Auto-dismiss after 3 seconds
- Slide-in animation

#### Console
- Fixed bottom console
- JSON response viewer
- Collapsible
- Syntax highlighting

### State Management

The app maintains state in memory and localStorage:

```javascript
state = {
  token: '',              // JWT access token
  refreshToken: '',       // JWT refresh token
  user: {},              // User object
  surveyId: '',          // Current survey ID
  buildingId: '',        // Current building ID
  surveys: [],           // List of surveys
  currentReport: null    // Current report data
}
```

### API Integration

All backend endpoints are integrated:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /land-surveys` - Create survey
- `GET /land-surveys` - List surveys
- `POST /building-inputs` - Create building
- `POST /wind` - Add wind data
- `POST /analysis/disaster/:id` - Run disaster analysis
- `POST /analysis/vastu/:id` - Run Vastu analysis
- `POST /analysis/report/:id` - Generate final report
- `GET /analysis/disaster/:id` - View disaster report
- `GET /analysis/vastu/:id` - View Vastu report
- `GET /analysis/report/:id` - View final report

### Error Handling

- Network error detection
- API error messages
- User-friendly notifications
- Console logging for debugging

## Styling

### Color Scheme

```css
--primary: #2563eb      /* Blue */
--success: #10b981      /* Green */
--danger: #ef4444       /* Red */
--warning: #f59e0b      /* Orange */
--info: #3b82f6         /* Light Blue */
```

### Responsive Design

- Desktop: Full sidebar + content
- Tablet: Stacked layout
- Mobile: Single column, horizontal nav

### Breakpoints

- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Vanilla JavaScript (no framework overhead)
- Minimal dependencies (Font Awesome icons only)
- Lazy loading of reports
- Efficient DOM manipulation
- LocalStorage for persistence

## Security

- JWT tokens stored in localStorage
- Automatic token inclusion in requests
- Logout clears all stored data
- No sensitive data in console (production)

## Customization

### Change API Endpoint

Edit `script.js`:

```javascript
const API = "https://your-api-domain.com/api/v1";
```

### Change Colors

Edit `style.css`:

```css
:root {
  --primary: #your-color;
  --success: #your-color;
  /* etc. */
}
```

### Add New Sections

1. Add navigation item in `index.html`
2. Add section content
3. Add `showSection()` call
4. Style in `style.css`

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Ensure backend has CORS enabled
2. Check `CORS_ORIGIN` in backend `.env`
3. Use a proper HTTP server (not file://)

### API Not Responding

1. Check backend is running: `http://localhost:5000/api/v1/health`
2. Verify API URL in `script.js`
3. Check browser console for errors

### Login Not Working

1. Check credentials are correct
2. Verify backend database is running
3. Check network tab for API response
4. Clear localStorage and try again

### Reports Not Showing

1. Ensure analysis has been run first
2. Check building ID is set
3. Verify token is valid
4. Check console for errors

## Future Enhancements

- [ ] PDF export functionality
- [ ] Chart visualizations
- [ ] Real-time analysis progress
- [ ] Multiple building comparison
- [ ] Historical data graphs
- [ ] Mobile app version
- [ ] Offline mode support
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues or questions:
- Email: support@smartloadanalyzer.com
- GitHub Issues: [repository-url]/issues

---

**Built with ❤️ for civil engineers**
