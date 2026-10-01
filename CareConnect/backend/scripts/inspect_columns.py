import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.database import engine
from sqlalchemy import inspect
inspector = inspect(engine)
cols = inspector.get_columns('blood_requests')
print([c['name'] for c in cols])
