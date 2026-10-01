from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime
)

from sqlalchemy.sql import func

from app.database import Base


class Notification(Base):

    __tablename__ = "notifications"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    request_id = Column(
        Integer
    )


    donor_id = Column(
        Integer
    )


    message = Column(
        String
    )


    status = Column(
        String,
        default="SENT"
    )

    device_token = Column(
    String
    )


    response_time = Column(
        DateTime(timezone=True),
        nullable=True
    )


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    