import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    rows = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='blood_requests' ORDER BY ordinal_position")).fetchall()
    print([r[0] for r in rows])
