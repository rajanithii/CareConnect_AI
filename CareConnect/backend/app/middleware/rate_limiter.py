"""
Rate limiting middleware
Prevents abuse of API endpoints
"""

import os
from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# Rate limits per endpoint
RATE_LIMITS = {
    "short": "5/minute",       # Login, token refresh
    "medium": "30/minute",     # Regular API calls
    "long": "100/hour",        # Bulk operations
}


async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Exception handler for slowapi RateLimitExceeded."""
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please try again later."},
    )
