"""
Unit tests for input validators and sanitizers.
"""

import pytest
from fastapi import HTTPException
from app.utils.validators import validate_email, validate_phone, validate_blood_group, sanitize_text


def test_valid_emails():
    assert validate_email("user@example.com") == "user@example.com"
    assert validate_email("hospital.admin@med.org") == "hospital.admin@med.org"


def test_invalid_emails():
    with pytest.raises(HTTPException):
        validate_email("invalid-email")
    with pytest.raises(HTTPException):
        validate_email("@missinguser.com")


def test_valid_blood_groups():
    for group in ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]:
        assert validate_blood_group(group) == group


def test_invalid_blood_groups():
    with pytest.raises(HTTPException):
        validate_blood_group("C+")
    with pytest.raises(HTTPException):
        validate_blood_group("XYZ")


def test_sanitize_text():
    # Strips HTML tags
    clean = sanitize_text("<script>alert('xss')</script>Emergency blood needed")
    assert "<script>" not in clean
    assert "Emergency blood needed" in clean

    # Detects destructive SQL commands
    with pytest.raises(HTTPException):
        sanitize_text("Important update; DROP TABLE users;")
