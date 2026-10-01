# Module 3: AI Demand Forecasting — Integration & Deployment Guide

**Module 3 (AI Demand Forecasting)** adds intelligent blood demand prediction using Groq LLM analysis of historical request patterns.

## Backend Integration

### 1. Environment Variables

Add to your `.env`:

```bash
# Already required for existing AI module
GROQ_API_KEY=your_groq_api_key_here

# Optional: Adjust forecasting defaults
FORECASTING_DEFAULT_DAYS_AHEAD=30
FORECASTING_LLM_MODEL=mixtral-8x7b-32768
```

### 2. Models & Database

**No new database tables required** — Module 3 reads from existing:
- `blood_requests` — historical demand data
- `blood_units` — inventory reference
- `blood_unit_logs` — usage tracking (Module 1)

### 3. Code Integration into `main.py`

Add these imports near the top (after existing model imports):

```python
from app.forecasting.forecasting_routes import router as forecasting_router
```

Register the router near the bottom (after existing `include_router` calls):

```python
app.include_router(forecasting_router)
```

That's it — no migrations, no schema changes.

### 4. Testing the Backend

Once deployed:

```bash
# Test health check
curl http://localhost:8000/forecasting/health

# Test demand forecast
curl -X POST http://localhost:8000/forecasting/demand \
  -H "Content-Type: application/json" \
  -d '{"hospital_id": 1, "days_ahead": 30}'

# Test peak analysis
curl http://localhost:8000/forecasting/peak-patterns?hospital_id=1

# Test seasonal analysis
curl http://localhost:8000/forecasting/seasonal-patterns?hospital_id=1
```

---

## Frontend Integration

### 1. Copy Files to Your Project

Copy these new files into your `src/`:

```
src/
├── api/
│   └── forecastingAPI.js          (new)
├── services/
│   └── forecastingService.js       (new)
└── pages/Hospital/
    ├── BloodBankForecasting.jsx    (new)
    └── PeakPatternsAnalysis.jsx    (new)
```

### 2. Add Routes

In your route file (e.g., `src/App.jsx` or `src/routes/`), add:

```jsx
import BloodBankForecasting from './pages/Hospital/BloodBankForecasting';
import PeakPatternsAnalysis from './pages/Hospital/PeakPatternsAnalysis';

// ... in your route definitions:
<Route path="/hospital/forecasting" element={<BloodBankForecasting />} />
<Route path="/hospital/forecasting/peaks" element={<PeakPatternsAnalysis />} />
```

### 3. Update Hospital Navigation

Update `src/components/hospital/hospitalNav.js`:

```javascript
import { BarChart3 } from 'lucide-react'; // Add to lucide imports

// Add to HOSPITAL_NAV array:
{ to: '/hospital/forecasting', label: 'Forecasting', icon: BarChart3 },
```

### 4. Test the Frontend

Navigate to `/hospital/forecasting` — you should see:
- 30-day demand forecast chart
- Trend analysis (increasing/stable/decreasing)
- Peak demand days
- Seasonal factors
- Operational recommendations
- Peak pattern insights from the last 90 days

---

## Architecture & Data Flow

### Backend Flow

```
Request → forecasting_routes.py (FastAPI endpoint)
    ↓
forecasting_service.py (Orchestration)
    ↓
Database query for historical blood_requests
    ↓
demand_analyzer.py (Groq LLM analyzer)
    ↓
prompts.py (Structured LLM prompts)
    ↓
validators.py (Response validation & error checking)
    ↓
Response → Pydantic schema validation
    ↓
Return to frontend
```

### Key Design Patterns

1. **Service Layer**: Business logic isolated from routes for testability
2. **Analyzers**: LLM calls wrapped in dedicated `DemandAnalyzer` class (matches `emergency_analyzer.py` pattern)
3. **Validators**: Groq responses validated before returning to frontend
4. **Error Handling**: Production-grade logging and detailed error messages
5. **Prompt Engineering**: Structured, deterministic prompts for consistent JSON output

---

## API Endpoints

### 1. Demand Forecast

```
POST /forecasting/demand
{
    "hospital_id": 1,
    "days_ahead": 30,
    "include_recommendations": true
}

Response:
{
    "forecast_period_days": 30,
    "daily_forecasts": [
        {
            "date": "2026-08-15",
            "predicted_units": 45,
            "confidence": 87,
            "primary_blood_groups": [{"blood_group": "O+", "units": 22}],
            "urgency_split": {"CRITICAL": 5, "HIGH": 15, ...}
        }
    ],
    "weekly_summary": [...],
    "trend": "stable|increasing|decreasing",
    "trend_confidence": 85,
    "peak_days": ["Monday", "Friday"],
    "seasonal_factors": ["end_of_month"],
    "anomalies_detected": [],
    "recommendations": ["Stock O+ to 500 units by Aug 20", ...]
}
```

### 2. Festival Impact Forecast

```
POST /forecasting/festival-impact
{
    "hospital_id": 1,
    "events": [
        {
            "event_name": "Diwali",
            "event_date": "2026-10-29",
            "event_type": "festival"
        }
    ]
}

Response:
{
    "festival_forecasts": [
        {
            "event_name": "Diwali",
            "event_date": "2026-10-29",
            "predicted_demand_increase_percent": 45,
            "predicted_total_units": 89,
            "confidence": 78,
            "primary_blood_groups_needed": ["O+", "B+"],
            "urgency_expected": "HIGH",
            "preparation_days_needed": 14,
            "notes": "Similar to last year's festival demand"
        }
    ],
    "overall_assessment": "moderate_increase|major_spike|minor_increase|normal"
}
```

### 3. Peak Demand Patterns

```
GET /forecasting/peak-patterns?hospital_id=1&days_lookback=90

Response:
{
    "peak_days_of_week": [
        {"day": "Monday", "avg_requests": 8.5, "avg_units": 42.0, "rank": 1}
    ],
    "peak_blood_groups": [
        {"blood_group": "O+", "request_frequency_percent": 35.2, "total_units_requested": 450, "rank": 1}
    ],
    "peak_urgency_distribution": {"CRITICAL": 10, "HIGH": 35, "MEDIUM": 40, "LOW": 15},
    "peak_hour": "14:00",
    "data_quality_score": 87,
    "insights": [...]
}
```

### 4. Seasonal Patterns

```
GET /forecasting/seasonal-patterns?hospital_id=1&months_lookback=12

Response:
{
    "months": [
        {
            "month": "January",
            "demand_level": "high",
            "avg_requests": 9.2,
            "avg_units": 46.0,
            "variance": 12.5,
            "primary_blood_groups": ["O+", "B+"],
            "notes": "Winter illnesses drive demand"
        }
    ],
    "peak_season": {
        "months": ["December", "January"],
        "reason": "Winter illnesses, holiday accidents",
        "avg_units_per_day": 48.0
    },
    "low_season": {...},
    "seasonal_recommendations": [...]
}
```

---

## Error Handling & Edge Cases

### Insufficient Historical Data

**Scenario**: Hospital has <30 days of request history

**Response**: 400 Bad Request

```json
{
    "detail": "Insufficient data for demand forecast: Request history cannot be empty"
}
```

**Fix**: Wait for more historical data to accumulate, or test with hospital that has ≥30 days.

### AI Service Unavailable

**Scenario**: Groq API is down or rate-limited

**Response**: 503 Service Unavailable

```json
{
    "detail": "AI analysis temporarily unavailable. Please try again later."
}
```

**Fix**: Retry after 30 seconds, or check Groq service status.

### Invalid Input

**Scenario**: Missing hospital_id or malformed dates

**Response**: 400 Bad Request with validation detail

```json
{
    "detail": "At least one event required"
}
```

---

## Performance Notes

- **Forecast generation**: ~2-5 seconds (Groq API + LLM processing)
- **Data retrieval**: <500ms (database query for historical data)
- **Frontend render**: <200ms (chart rendering with Recharts)

**Optimization**: Results are NOT cached server-side by default. If you want to cache forecasts for 24 hours to reduce Groq API load:

1. Add Redis caching in `forecasting_service.py`
2. Key pattern: `forecast:{hospital_id}:{days_ahead}`
3. TTL: 86400 seconds (24 hours)

---

## Logging & Monitoring

Module 3 logs all operations:

```python
# Examples of log outputs:
logger.info(f"Starting demand forecast for hospital {hospital_id}, {days_ahead} days")
logger.info(f"Retrieved {len(formatted)} historical requests for hospital {hospital_id}")
logger.error(f"Forecast generation failed: {e}")
```

Monitor these logs in production to catch:
- Groq API failures
- Insufficient historical data patterns
- Unusual forecast confidence drops

---

## Known Limitations & Future Work

1. **No caching**: Each forecast request hits Groq API. Implement Redis cache for production scale.
2. **Festival list**: Currently manual input. Could integrate with Google Calendar API for automatic event detection.
3. **External factors**: Forecasts don't account for:
   - Hospital outages / staffing changes
   - Regional health campaigns
   - Economic indicators
   - Weather/seasonal events (partially addressed in seasonal analysis)
4. **Multi-hospital**: No cross-hospital demand pattern analysis. Could build cluster forecasting.

---

## Quick Start Checklist

- [ ] Add `GROQ_API_KEY` to `.env`
- [ ] Add imports and router registration to `main.py`
- [ ] Copy frontend files (`api/`, `services/`, `pages/`)
- [ ] Add routes to route file
- [ ] Update `hospitalNav.js`
- [ ] Test `/forecasting/health` endpoint
- [ ] Navigate to `/hospital/forecasting` and verify forecast loads
- [ ] Test peak patterns and seasonal analysis pages

---

## Support & Troubleshooting

**Q: "No forecast data" on first load**
A: Ensure your hospital has ≥30 days of blood request history in the database.

**Q: Confidence scores seem low**
A: Low data quality or anomalous patterns detected. Ensure ≥90 days of history for better predictions.

**Q: AI service temporarily unavailable**
A: Groq API rate limit or service issue. Retry after 30 seconds.

---

## Module Dependencies

- **Module 1** (Smart Blood Bank Management) — provides BloodUnit/BloodUnitLog models
- **Groq LLM API** — required for demand analysis
- **Recharts** — charts already in `package.json`

No new dependencies are required beyond those in [`backend/requirements.txt`](../../../backend/requirements.txt).
