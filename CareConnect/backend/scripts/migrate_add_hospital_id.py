import sys
from pathlib import Path

# Ensure backend folder is on sys.path so `app` imports work when run directly
BASE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE))

from sqlalchemy import inspect, text
from app.database import engine

inspector = inspect(engine)
cols = inspector.get_columns('blood_requests')
col_names = [c['name'] for c in cols]

if 'hospital_id' in col_names:
    print('Column hospital_id already exists on blood_requests')
else:
    print('Adding hospital_id column to blood_requests')
    # Use a transaction/BEGIN so DDL is committed reliably
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE blood_requests ADD COLUMN hospital_id INTEGER"))
    print('Done')
