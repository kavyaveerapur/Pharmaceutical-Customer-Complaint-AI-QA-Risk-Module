from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Union, Any, Dict, List

class ComplaintTextRequest(BaseModel):
    text: str

class ChatUpdateRequest(BaseModel):
    user_message: str
    current_form: Dict[str, Any]

class DuplicateCheckRequest(BaseModel):
    batch_number: Optional[str] = None
    product_name: Optional[str] = None
    customer_name: Optional[str] = None
    complaint_description: Optional[str] = None

# --------------------------------------------------
# CREATE COMPLAINT
# --------------------------------------------------

class ComplaintCreate(BaseModel):
    # Origin & Customer
    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None

    # Product & Batch
    product_name: Optional[str] = None
    product_strength: Optional[str] = None
    batch_number: Optional[str] = None
    affected_quantity: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None

    # Facility & Material Impact
    originating_site_block: Optional[str] = None
    impacted_npm: Optional[str] = None

    # Complaint
    complaint_type: Optional[str] = None
    complaint_date: Optional[str] = None 
    complaint_description: Optional[str] = ""

    # AI analysis fields
    category: Optional[str] = None
    sentiment: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    suggested_next_action: Optional[str] = None
    initial_risk_assessment: Optional[str] = None
    root_cause_recommendation: Optional[str] = None
    capa_recommendation: Optional[str] = None
    completeness_score: Optional[int] = 100
    executive_summary: Optional[str] = None


# --------------------------------------------------
# COMPLAINT RESPONSE
# --------------------------------------------------

class ComplaintResponse(BaseModel):
    id: int

    # Origin & Customer
    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None

    # Product & Batch
    product_name: Optional[str] = None
    product_strength: Optional[str] = None
    batch_number: Optional[str] = None
    affected_quantity: Optional[str] = None
    manufacturing_date: Optional[Any] = None
    expiry_date: Optional[Any] = None

    # Facility & Material Impact
    originating_site_block: Optional[str] = None
    impacted_npm: Optional[str] = None

    # Complaint
    complaint_type: Optional[str] = None
    complaint_date: Optional[Any] = None
    complaint_description: Optional[str] = None

    # AI analysis
    category: Optional[str] = None
    sentiment: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    suggested_next_action: Optional[str] = None
    initial_risk_assessment: Optional[str] = None
    root_cause_recommendation: Optional[str] = None
    capa_recommendation: Optional[str] = None
    completeness_score: Optional[int] = None
    executive_summary: Optional[str] = None

    # Workflow
    status: Optional[str] = "New"
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True


# --------------------------------------------------
# COMPLAINT + AI ANALYSIS RESPONSE
# --------------------------------------------------

class ComplaintWithAIResponse(BaseModel):
    complaint: ComplaintResponse
    ai_analysis: dict