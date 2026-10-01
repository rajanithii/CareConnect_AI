import sys
from pathlib import Path

# Ensure backend folder is on sys.path so `app` imports work when run directly
BASE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE))

from sqlalchemy import text
from app.database import SessionLocal

# Criteria for fake requests — tune as needed
FAKE_HOSPITALS = [None, '', 'Unknown']
FAKE_PATTERNS = ['AI Generated Request', 'E2E Test Patient']

def cleanup():
    db = SessionLocal()
    try:
        # delete by hospital in fake list
        db.execute(text("DELETE FROM blood_requests WHERE hospital IS NULL OR hospital = '' OR hospital = 'Unknown'"))
        print('Deleted rows for empty/Unknown hospital')
        db.commit()
        # delete by patient_name patterns
        for p in FAKE_PATTERNS:
            db.execute(text("DELETE FROM blood_requests WHERE patient_name LIKE :pat"), {'pat': f'%{p}%'})
            print(f"Deleted rows with pattern {p}")
            db.commit()
    finally:
        db.close()

if __name__ == '__main__':
    cleanup()
