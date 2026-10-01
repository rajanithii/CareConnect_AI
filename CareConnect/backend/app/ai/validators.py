BLOOD_GROUP_MAP = {
    "o positive": "O+",
    "o+": "O+",

    "o negative": "O-",
    "o-": "O-",

    "a positive": "A+",
    "a+": "A+",

    "a negative": "A-",
    "a-": "A-",

    "b positive": "B+",
    "b+": "B+",

    "b negative": "B-",
    "b-": "B-",

    "ab positive": "AB+",
    "ab+": "AB+",

    "ab negative": "AB-",
    "ab-": "AB-"
}


URGENCY_MAP = {

    "low": "LOW",

    "normal": "MEDIUM",

    "medium": "MEDIUM",

    "urgent": "HIGH",

    "high": "HIGH",

    "emergency": "CRITICAL",

    "critical": "CRITICAL"
}


def standardize_blood_group(blood_group):

    if not blood_group:
        return None

    return BLOOD_GROUP_MAP.get(
        blood_group.lower().strip(),
        blood_group
    )


def standardize_urgency(urgency):

    if not urgency:
        return "MEDIUM"

    return URGENCY_MAP.get(
        urgency.lower().strip(),
        "MEDIUM"
    )


def validate_request(data):

    required_fields = [
        "patient_name",
        "blood_group",
        "hospital",
        "city"
    ]

    missing = []

    for field in required_fields:

        value = data.get(field)

        if value is None or str(value).strip() == "":
            missing.append(field)

    data["blood_group"] = standardize_blood_group(
        data.get("blood_group")
    )

    data["urgency"] = standardize_urgency(
        data.get("urgency")
    )

    return {

        "valid": len(missing) == 0,

        "missing_fields": missing,

        "data": data

    }