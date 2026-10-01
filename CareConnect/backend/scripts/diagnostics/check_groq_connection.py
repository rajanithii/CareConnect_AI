import os
import traceback
from app.forecasting.demand_analyzer import DemandAnalyzer

api_key = os.getenv('GROQ_API_KEY')
print('api key present', bool(api_key))
analyzer = DemandAnalyzer(api_key)
try:
    print(analyzer._call_groq('You are a helpful assistant.', 'Return valid JSON: {"ok": true}'))
except Exception as e:
    print(type(e).__name__, e)
    traceback.print_exc()
