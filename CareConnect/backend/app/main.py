from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

#import app.firebase.firebase_config

from app.database import engine
from app.models.donor import Donor
from app.models.hospital import Hospital
from app.models.blood_request import BloodRequest
from app.models.storage_location import StorageLocation
from app.models.blood_inventory import BloodUnit
from app.models.blood_unit_log import BloodUnitLog
from app.routes.donor_routes import router as donor_router
from app.auth.auth_routes import router as auth_router
from app.hospital_auth.hospital_auth_routes import router as hospital_auth_router
from app.requests.request_routes import router as request_router
from app.matching.matching_routes import router as matching_router
from app.ai.ai_routes import router as ai_router
from app.notifications.notification_routes import router as notification_router
from app.notifications import ws_manager
from app.hospital.hospital_routes import router as hospital_router
from app.donor_dashboard.donor_dashboard_routes import router as donor_dashboard_router
from app.blood_bank.blood_bank_routes import router as blood_bank_router
from app.blood_bank.blood_bank_analytics_routes import router as blood_bank_analytics_router
from app.routes.public_routes import router as public_router
from app.routes.landing_routes import router as landing_router
from app.routes.newsletter_routes import router as newsletter_router
from app.forecasting.forecasting_routes import router as forecasting_router
from app.shortage_prediction.shortage_prediction_routes import router as shortage_router
from app.shortage_prediction.models import ShortageAlert, RiskAssessment
from app.recommendations.recommendation_routes import router as recommendation_router
from app.recommendations.models import Recommendation, DonorCampaign
from app.inter_hospital_exchange.routes import router as exchange_router
from app.inter_hospital_exchange.models import BloodTransferRequest, BloodTransferLog
from app.blood_expiry.routes import router as expiry_router
from app.blood_expiry.models import ExpiryAlert, FIFOUsageLog, ExpiryReport
from app.admin_portal.routes import router as admin_router
from app.admin_portal.models import (
    HospitalApprovalRequest,
    AuditLog,
    SystemAlert,
    AdminDashboardSnapshot,
)

Donor.metadata.create_all(bind=engine)
Hospital.metadata.create_all(bind=engine)
ShortageAlert.metadata.create_all(bind=engine)
RiskAssessment.metadata.create_all(bind=engine)
Recommendation.metadata.create_all(bind=engine)
DonorCampaign.metadata.create_all(bind=engine)
BloodTransferRequest.metadata.create_all(bind=engine)
BloodTransferLog.metadata.create_all(bind=engine)
ExpiryAlert.metadata.create_all(bind=engine)
FIFOUsageLog.metadata.create_all(bind=engine)
ExpiryReport.metadata.create_all(bind=engine)
HospitalApprovalRequest.metadata.create_all(bind=engine)
AuditLog.metadata.create_all(bind=engine)
SystemAlert.metadata.create_all(bind=engine)
AdminDashboardSnapshot.metadata.create_all(bind=engine)

from app.middleware.rate_limiter import limiter, rate_limit_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI(
    title="BloodLink AI API",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# -----------------------------------------------------------
# CORS — required so the Vite dev server (http://localhost:5173)
# and any deployed frontend origin can call this API from the
# browser. Without this, every fetch/axios call from the React
# app fails with a CORS error before it even reaches a route.
# -----------------------------------------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # add your deployed frontend URL here once you host it, e.g.
    # "https://bloodlink-ai.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(donor_router, prefix="/donors", tags=["Donors"])
app.include_router(auth_router)
app.include_router(hospital_auth_router)
app.include_router(request_router)
app.include_router(matching_router)
app.include_router(ai_router)
app.include_router(notification_router)
app.include_router(blood_bank_router)
app.include_router(blood_bank_analytics_router)
app.include_router(forecasting_router)
app.include_router(shortage_router)
app.include_router(recommendation_router)
app.include_router(exchange_router)
app.include_router(expiry_router)
app.include_router(admin_router)
app.include_router(landing_router)
app.include_router(newsletter_router)

# WebSocket endpoint for request updates
@app.websocket("/ws/requests/{request_id}")
async def websocket_request_updates(websocket, request_id: int):
    # Import here to avoid circulars
    from app.notifications.ws_manager import manager
    await manager.connect(request_id, websocket)
    try:
        while True:
            # keep connection open; we don't expect messages from client
            await websocket.receive_text()
    except Exception:
        await manager.disconnect(request_id, websocket)
app.include_router(hospital_router)
app.include_router(donor_dashboard_router)
app.include_router(public_router)

@app.get("/")
def home():
    return {
        "message": "BloodLink AI Backend is Running!"
    }

@app.get("/favicon.ico")
def favicon():
    favicon_path = Path(__file__).resolve().parents[2] / 'frontend' / 'public' / 'favicon.svg'
    return FileResponse(favicon_path)
