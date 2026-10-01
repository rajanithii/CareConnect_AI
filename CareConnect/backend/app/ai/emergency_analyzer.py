import re


def analyze_emergency(text):

    text = text.lower()


    result = {
        "blood_group": None,
        "urgency": "NORMAL",
        "location": None
    }


    # Blood group extraction

    blood_patterns = [
        "a+",
        "a-",
        "b+",
        "b-",
        "ab+",
        "ab-",
        "o+",
        "o-"
    ]


    for group in blood_patterns:

        if group in text:
            result["blood_group"] = group.upper()



    # Urgency detection

    urgent_words = [
        "urgent",
        "emergency",
        "accident",
        "critical",
        "immediately"
    ]


    for word in urgent_words:

        if word in text:

            result["urgency"] = "CRITICAL"



    # Simple location extraction
    cities = [
        "chennai",
        "trichy",
        "bengaluru",
        "coimbatore",
        "madurai"
    ]


    for city in cities:

        if city in text:

            result["location"] = city.title()



    return result