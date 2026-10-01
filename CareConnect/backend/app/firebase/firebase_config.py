import firebase_admin
from firebase_admin import credentials
import os


if not firebase_admin._apps:

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    firebase_key = os.path.join(
        BASE_DIR,
        "serviceAccountKey.json"
    )

    cred = credentials.Certificate(firebase_key)

    firebase_admin.initialize_app(cred)

    print("Firebase Connected Successfully")