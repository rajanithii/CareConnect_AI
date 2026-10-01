from app.database import SessionLocal
from app.models.blood_request import BloodRequest
from datetime import datetime, timedelta


db = SessionLocal()
cutoff = datetime.utcnow() - timedelta(days=90)
print('hospital1 count datetime cutoff', db.query(BloodRequest).filter(BloodRequest.hospital_id == 1, BloodRequest.created_at >= cutoff).count())
print('hospital1 count date cutoff', db.query(BloodRequest).filter(BloodRequest.hospital_id == 1, BloodRequest.created_at >= (datetime.utcnow().date() - timedelta(days=90))).count())
print('latest rows')
for r in db.query(BloodRequest).filter(BloodRequest.hospital_id == 1).order_by(BloodRequest.created_at.desc()).limit(10).all():
    print(r.id, r.hospital_id, r.created_at, r.blood_group, r.urgency, r.status)
db.close()
