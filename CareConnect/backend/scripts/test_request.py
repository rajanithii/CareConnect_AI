import requests
try:
    r = requests.get('http://127.0.0.1:8000/hospital/requests')
    print(r.status_code)
    print(r.text[:2000])
except Exception as e:
    print('request failed', e)
