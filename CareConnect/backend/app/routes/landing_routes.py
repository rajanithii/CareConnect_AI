"""
Landing Page API Routes
Provides data for landing page components (testimonials, partners, stats)
"""

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from datetime import datetime

# Router
router = APIRouter(prefix="/api", tags=["landing"])

# ════════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ════════════════════════════════════════════════════════════════════════════

class TestimonialResponse(BaseModel):
    """Testimonial data model"""
    id: int
    name: str
    title: str
    hospital: str
    text: str
    rating: int  # 1-5 stars
    image_url: str = None
    date_added: datetime

    class Config:
        from_attributes = True


class PartnerResponse(BaseModel):
    """Partner hospital data model"""
    id: int
    name: str
    logo_url: str
    city: str
    state: str
    country: str
    hospital_type: str  # "Hospital", "Blood Bank", "Red Cross", etc.
    beds: int = None
    patients_served: int = None

    class Config:
        from_attributes = True


class StatisticsResponse(BaseModel):
    """Landing page statistics"""
    lives_saved: int
    hospitals_connected: int
    active_donors: int
    average_response_time: float  # in minutes


# ════════════════════════════════════════════════════════════════════════════
# TESTIMONIALS ENDPOINT
# ════════════════════════════════════════════════════════════════════════════

@router.get("/testimonials", response_model=List[TestimonialResponse])
async def get_testimonials(skip: int = 0, limit: int = 10):
    """
    Get testimonials for landing page
    
    Query Parameters:
        skip: Number of testimonials to skip (for pagination)
        limit: Maximum number of testimonials to return
    
    Returns:
        List of testimonial objects
    
    Example Response:
    [
        {
            "id": 1,
            "name": "Dr. Sarah Johnson",
            "title": "Chief Medical Officer",
            "hospital": "City Medical Center",
            "text": "BloodLink AI transformed our emergency response...",
            "rating": 5,
            "image_url": "https://...",
            "date_added": "2026-08-21T10:30:00"
        },
        ...
    ]
    """
    try:
        # Mock data - replace with database queries when ready
        mock_testimonials = [
            {
                "id": 1,
                "name": "Dr. Sarah Johnson",
                "title": "Chief Medical Officer",
                "hospital": "City Medical Center",
                "text": "BloodLink AI has transformed our emergency response times. We can now match compatible donors in under 10 minutes, compared to 4+ hours previously.",
                "rating": 5,
                "image_url": "https://via.placeholder.com/400x400?text=Dr+Sarah",
                "date_added": datetime(2026, 8, 1),
            },
            {
                "id": 2,
                "name": "Dr. Michael Chen",
                "title": "Blood Bank Director",
                "hospital": "Regional Blood Bank",
                "text": "The AI-powered matching reduces blood waste by up to 30%. This is a game-changer for inventory management.",
                "rating": 5,
                "image_url": "https://via.placeholder.com/400x400?text=Dr+Michael",
                "date_added": datetime(2026, 8, 5),
            },
            {
                "id": 3,
                "name": "Dr. Priya Patel",
                "title": "Emergency Medicine Specialist",
                "hospital": "Metro Hospital",
                "text": "Our trauma response team loves BloodLink. The real-time notifications help us prepare for incoming patients faster.",
                "rating": 5,
                "image_url": "https://via.placeholder.com/400x400?text=Dr+Priya",
                "date_added": datetime(2026, 8, 10),
            },
            {
                "id": 4,
                "name": "Dr. James Wilson",
                "title": "Hospital Administrator",
                "hospital": "Valley Health System",
                "text": "Implementation was seamless. The training was minimal, and our staff was productive immediately.",
                "rating": 4,
                "image_url": "https://via.placeholder.com/400x400?text=Dr+James",
                "date_added": datetime(2026, 8, 15),
            },
            {
                "id": 5,
                "name": "Dr. Amelia Rodriguez",
                "title": "Director of Operations",
                "hospital": "Riverside Medical",
                "text": "The system integrates seamlessly with our existing workflows. ROI was visible in the first month.",
                "rating": 5,
                "image_url": "https://via.placeholder.com/400x400?text=Dr+Amelia",
                "date_added": datetime(2026, 8, 20),
            },
        ]
        
        return mock_testimonials[skip : skip + limit]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch testimonials")


@router.get("/testimonials/{testimonial_id}", response_model=TestimonialResponse)
async def get_testimonial(testimonial_id: int):
    """
    Get a specific testimonial by ID
    
    Path Parameters:
        testimonial_id: ID of the testimonial
    
    Returns:
        Single testimonial object
    """
    try:
        # Mock data
        testimonials = {
            1: {
                "id": 1,
                "name": "Dr. Sarah Johnson",
                "title": "Chief Medical Officer",
                "hospital": "City Medical Center",
                "text": "BloodLink AI has transformed our emergency response times. We can now match compatible donors in under 10 minutes, compared to 4+ hours previously.",
                "rating": 5,
                "image_url": "https://via.placeholder.com/400x400?text=Dr+Sarah",
                "date_added": datetime(2026, 8, 1),
            },
            2: {
                "id": 2,
                "name": "Dr. Michael Chen",
                "title": "Blood Bank Director",
                "hospital": "Regional Blood Bank",
                "text": "The AI-powered matching reduces blood waste by up to 30%. This is a game-changer for inventory management.",
                "rating": 5,
                "image_url": "https://via.placeholder.com/400x400?text=Dr+Michael",
                "date_added": datetime(2026, 8, 5),
            },
        }
        
        if testimonial_id not in testimonials:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        return testimonials[testimonial_id]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch testimonial")


# ════════════════════════════════════════════════════════════════════════════
# PARTNERS ENDPOINT
# ════════════════════════════════════════════════════════════════════════════

@router.get("/partners", response_model=List[PartnerResponse])
async def get_partners(skip: int = 0, limit: int = 20, partner_type: str = None):
    """
    Get partner hospitals/organizations for landing page
    
    Query Parameters:
        skip: Number of partners to skip (for pagination)
        limit: Maximum number of partners to return
        partner_type: Filter by type (Hospital, Blood Bank, Red Cross, etc.)
    
    Returns:
        List of partner objects
    
    Example Response:
    [
        {
            "id": 1,
            "name": "City Medical Center",
            "logo_url": "https://...",
            "city": "New York",
            "state": "NY",
            "country": "USA",
            "hospital_type": "Hospital",
            "beds": 500,
            "patients_served": 125000
        },
        ...
    ]
    """
    try:
        # Mock data with realistic partners
        mock_partners = [
            {
                "id": 1,
                "name": "City Medical Center",
                "logo_url": "https://via.placeholder.com/200x100?text=City+Medical",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "hospital_type": "Hospital",
                "beds": 500,
                "patients_served": 125000,
            },
            {
                "id": 2,
                "name": "Metropolitan Hospital",
                "logo_url": "https://via.placeholder.com/200x100?text=Metro+Hospital",
                "city": "Los Angeles",
                "state": "CA",
                "country": "USA",
                "hospital_type": "Hospital",
                "beds": 450,
                "patients_served": 98000,
            },
            {
                "id": 3,
                "name": "Regional Blood Bank",
                "logo_url": "https://via.placeholder.com/200x100?text=Regional+BB",
                "city": "Chicago",
                "state": "IL",
                "country": "USA",
                "hospital_type": "Blood Bank",
                "beds": None,
                "patients_served": 250000,
            },
            {
                "id": 4,
                "name": "Valley Health System",
                "logo_url": "https://via.placeholder.com/200x100?text=Valley+Health",
                "city": "Phoenix",
                "state": "AZ",
                "country": "USA",
                "hospital_type": "Hospital",
                "beds": 350,
                "patients_served": 75000,
            },
            {
                "id": 5,
                "name": "United Red Cross",
                "logo_url": "https://via.placeholder.com/200x100?text=Red+Cross",
                "city": "Washington",
                "state": "DC",
                "country": "USA",
                "hospital_type": "Red Cross",
                "beds": None,
                "patients_served": 500000,
            },
            {
                "id": 6,
                "name": "Riverside Medical Center",
                "logo_url": "https://via.placeholder.com/200x100?text=Riverside",
                "city": "San Francisco",
                "state": "CA",
                "country": "USA",
                "hospital_type": "Hospital",
                "beds": 400,
                "patients_served": 85000,
            },
            {
                "id": 7,
                "name": "Mount Sinai Health System",
                "logo_url": "https://via.placeholder.com/200x100?text=Mount+Sinai",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "hospital_type": "Hospital",
                "beds": 600,
                "patients_served": 150000,
            },
            {
                "id": 8,
                "name": "National Blood Services",
                "logo_url": "https://via.placeholder.com/200x100?text=National+Blood",
                "city": "Boston",
                "state": "MA",
                "country": "USA",
                "hospital_type": "Blood Bank",
                "beds": None,
                "patients_served": 300000,
            },
        ]
        
        # Filter by type if provided
        if partner_type:
            mock_partners = [p for p in mock_partners if p["hospital_type"] == partner_type]
        
        return mock_partners[skip : skip + limit]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch partners")


@router.get("/partners/{partner_id}", response_model=PartnerResponse)
async def get_partner(partner_id: int):
    """
    Get a specific partner by ID
    
    Path Parameters:
        partner_id: ID of the partner
    
    Returns:
        Single partner object
    """
    try:
        # Mock data
        partners = {
            1: {
                "id": 1,
                "name": "City Medical Center",
                "logo_url": "https://via.placeholder.com/200x100?text=City+Medical",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "hospital_type": "Hospital",
                "beds": 500,
                "patients_served": 125000,
            },
            2: {
                "id": 2,
                "name": "Metropolitan Hospital",
                "logo_url": "https://via.placeholder.com/200x100?text=Metro+Hospital",
                "city": "Los Angeles",
                "state": "CA",
                "country": "USA",
                "hospital_type": "Hospital",
                "beds": 450,
                "patients_served": 98000,
            },
        }
        
        if partner_id not in partners:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        return partners[partner_id]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch partner")


# ════════════════════════════════════════════════════════════════════════════
# STATISTICS ENDPOINT
# ════════════════════════════════════════════════════════════════════════════

@router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics():
    """
    Get landing page statistics
    
    Returns:
        Statistics object with key metrics
    
    Example Response:
    {
        "lives_saved": 45000,
        "hospitals_connected": 320,
        "active_donors": 18000,
        "average_response_time": 8.2
    }
    """
    try:
        # Mock data - replace with real calculations from database when ready
        stats = {
            "lives_saved": 45000,
            "hospitals_connected": 320,
            "active_donors": 18000,
            "average_response_time": 8.2,  # minutes
        }
        
        return stats
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")


# ════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ════════════════════════════════════════════════════════════════════════════

@router.get("/landing/health")
async def health_check():
    """
    Health check for landing page API
    """
    return {"status": "ok", "service": "landing-page"}
