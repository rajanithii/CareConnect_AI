"""
Input validation and sanitization
"""

import re
from fastapi import HTTPException


def validate_email(email: str) -> str:
    """Validate email format."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    return email


def validate_phone(phone: str) -> str:
    """Validate phone number."""
    pattern = r"^\+?1?\d{9,15}$"
    clean_phone = phone.replace("-", "").replace(" ", "")
    if not re.match(pattern, clean_phone):
        raise HTTPException(status_code=400, detail="Invalid phone number")
    return phone


def validate_blood_group(blood_group: str) -> str:
    """Validate blood group."""
    valid_groups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
    if blood_group not in valid_groups:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid blood group. Must be one of: {', '.join(valid_groups)}",
        )
    return blood_group


def sanitize_text(text: str | None, max_length: int = 500) -> str:
    """Remove potentially harmful characters and SQL injection patterns."""
    if not text:
        return ""
    if len(text) > max_length:
        raise HTTPException(status_code=400, detail=f"Text exceeds maximum length of {max_length}")

    # Remove HTML tags
    clean = re.sub(r"<[^>]+>", "", text)

    # Detect dangerous destructive SQL commands as standalone words
    dangerous_patterns = [r"\bDROP\b", r"\bDELETE\b", r"\bTRUNCATE\b", r"\bEXEC\b"]
    for pattern in dangerous_patterns:
        if re.search(pattern, clean, re.IGNORECASE):
            raise HTTPException(status_code=400, detail="Invalid input detected")

    return clean.strip()
