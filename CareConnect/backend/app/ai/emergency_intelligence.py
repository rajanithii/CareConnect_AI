import os
import json

from groq import Groq
from dotenv import load_dotenv

from app.ai.prompts import REQUEST_PROMPT
from app.ai.validators import validate_request

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def extract_blood_request(text: str):

    prompt = f"""
{REQUEST_PROMPT}

User Message:

{text}
"""

    completion = client.chat.completions.create(

        model="llama-3.1-8b-instant",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0

    )

    response = completion.choices[0].message.content

    extracted_data = json.loads(response)

    validated = validate_request(extracted_data)

    return validated