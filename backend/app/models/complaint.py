from typing import Optional, Any
from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database.base import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)  # type: ignore

    # --------------------------------------------------
    # ORIGIN & CUSTOMER
    # --------------------------------------------------

    complaint_source: Mapped[Optional[str]] = Column(String(50), nullable=True)  # type: ignore
    customer_name: Mapped[Optional[str]] = Column(String(255), nullable=True)  # type: ignore

    # --------------------------------------------------
    # PRODUCT & BATCH
    # --------------------------------------------------

    product_name: Mapped[Optional[str]] = Column(String(255), nullable=True)  # type: ignore
    product_strength: Mapped[Optional[str]] = Column(String(100), nullable=True)  # type: ignore
    batch_number: Mapped[Optional[str]] = Column(String(100), nullable=True)  # type: ignore
    affected_quantity: Mapped[Optional[str]] = Column(String(100), nullable=True)  # type: ignore

    manufacturing_date: Mapped[Optional[str]] = Column(String(100), nullable=True)  # type: ignore
    expiry_date: Mapped[Optional[str]] = Column(String(100), nullable=True)  # type: ignore

    # --------------------------------------------------
    # FACILITY & MATERIAL IMPACT
    # --------------------------------------------------

    originating_site_block: Mapped[Optional[str]] = Column(String(255), nullable=True)  # type: ignore
    impacted_npm: Mapped[Optional[str]] = Column(String(255), nullable=True)  # type: ignore

    # --------------------------------------------------
    # COMPLAINT DETAILS
    # --------------------------------------------------

    complaint_type: Mapped[Optional[str]] = Column(String(100), nullable=True)  # type: ignore
    complaint_date: Mapped[Optional[str]] = Column(String(100), nullable=True)  # type: ignore

    complaint_description: Mapped[str] = Column(Text, nullable=False)  # type: ignore

    # --------------------------------------------------
    # AI ANALYSIS
    # --------------------------------------------------

    category: Mapped[Optional[str]] = Column(String(255), nullable=True)  # type: ignore
    sentiment: Mapped[Optional[str]] = Column(String(50), nullable=True)  # type: ignore
    severity: Mapped[Optional[str]] = Column(String(50), nullable=True)  # type: ignore
    priority: Mapped[Optional[str]] = Column(String(50), nullable=True)  # type: ignore

    suggested_next_action: Mapped[Optional[str]] = Column(Text, nullable=True)  # type: ignore
    initial_risk_assessment: Mapped[Optional[str]] = Column(Text, nullable=True)  # type: ignore
    root_cause_recommendation: Mapped[Optional[str]] = Column(Text, nullable=True)  # type: ignore
    capa_recommendation: Mapped[Optional[str]] = Column(Text, nullable=True)  # type: ignore
    completeness_score: Mapped[Optional[int]] = Column(Integer, nullable=True)  # type: ignore
    executive_summary: Mapped[Optional[str]] = Column(Text, nullable=True)  # type: ignore

    # --------------------------------------------------
    # WORKFLOW
    # --------------------------------------------------

    status: Mapped[str] = Column(  # type: ignore
        String(50),
        default="New",
        nullable=False
    )

    created_at: Mapped[Optional[Any]] = Column(  # type: ignore
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now()
    )