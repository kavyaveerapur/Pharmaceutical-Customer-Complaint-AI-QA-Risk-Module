import os
import tempfile
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.database.database import engine
from app.database.base import Base
from app.models.complaint import Complaint
from app.schemas import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintWithAIResponse,
    ComplaintTextRequest,
    ChatUpdateRequest,
    DuplicateCheckRequest
)
from app.services.langgraph_workflow import run_complaint_analysis, process_chat_update
from app.services.document_service import extract_text_from_file

from sqlalchemy import text

# Auto-create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Auto-migrate missing columns for existing MySQL/SQLite tables
def auto_migrate_schema():
    with engine.connect() as conn:
        columns_to_add = [
            ("root_cause_recommendation", "TEXT"),
            ("capa_recommendation", "TEXT"),
            ("completeness_score", "INT"),
            ("executive_summary", "TEXT"),
            ("manufacturing_date", "VARCHAR(100)"),
            ("expiry_date", "VARCHAR(100)"),
            ("complaint_date", "VARCHAR(100)"),
        ]
        for col_name, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE complaints ADD COLUMN {col_name} {col_type};"))
                conn.commit()
            except Exception:
                pass

auto_migrate_schema()

app = FastAPI(
    title="AI Customer Complaint Management System",
    description="Backend API for Pharmaceutical Customer Complaint Management",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to the AI Customer Complaint Management System 🚀",
        "status": "online"
    }


# --------------------------------------------------
# FILE UPLOAD + EXTRACTION (PDF, TXT, EML, DOCX)
# --------------------------------------------------

@app.post("/complaints/upload-pdf")
@app.post("/complaints/upload-file")
async def upload_complaint_file(
    file: UploadFile = File(...)
):
    """
    Upload a complaint file (PDF, TXT, EML), extract text,
    and run AI analysis via LangGraph.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected.")

    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    suffix = os.path.splitext(file.filename)[1] or ".tmp"
    temp_file_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        extracted_text = extract_text_from_file(temp_file_path, file.filename)
        if not extracted_text:
            extracted_text = f"Complaint report uploaded from file: {file.filename}"

        ai_result = run_complaint_analysis(extracted_text)

        return {
            "message": "File processed successfully.",
            "filename": file.filename,
            "extracted_text": extracted_text,
            "ai_analysis": ai_result
        }
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


# --------------------------------------------------
# PASTED COMPLAINT TEXT + AI ANALYSIS
# --------------------------------------------------

@app.post("/complaints/analyze-text")
def analyze_complaint_text(complaint: ComplaintTextRequest):
    """
    Analyze complaint submitted as pasted text or email.
    """
    if not complaint.text.strip():
        raise HTTPException(status_code=400, detail="Complaint text cannot be empty.")

    result = run_complaint_analysis(complaint.text)

    return {
        "message": "Complaint text analyzed successfully.",
        "extracted_text": complaint.text,
        "complaint": {
            "complaint_source": result.get("complaint_source"),
            "customer_name": result.get("customer_name"),
            "product_name": result.get("product_name"),
            "product_strength": result.get("product_strength"),
            "batch_number": result.get("batch_number"),
            "affected_quantity": result.get("affected_quantity"),
            "manufacturing_date": result.get("manufacturing_date"),
            "expiry_date": result.get("expiry_date"),
            "originating_site_block": result.get("originating_site_block"),
            "impacted_npm": result.get("impacted_npm"),
            "complaint_description": complaint.text
        },
        "ai_analysis": result
    }


# --------------------------------------------------
# CONVERSATIONAL CHAT UPDATE
# --------------------------------------------------

@app.post("/complaints/chat-update")
def chat_update_form(request: ChatUpdateRequest):
    """
    Handles follow-up chat messages (e.g. 'ah sorry the batch number is CHG 260712A')
    and dynamically updates form fields.
    """
    if not request.user_message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    result = process_chat_update(request.user_message, request.current_form)
    return result


# --------------------------------------------------
# DUPLICATE COMPLAINT DETECTION
# --------------------------------------------------

@app.post("/complaints/duplicate-check")
def check_duplicate_complaint(
    request: DuplicateCheckRequest,
    db: Session = Depends(get_db)
):
    """
    Checks if a complaint with matching batch number or similar details already exists in DB.
    """
    duplicates = []
    if request.batch_number:
        matches = db.query(Complaint).filter(Complaint.batch_number == request.batch_number).all()
        for m in matches:
            duplicates.append({
                "id": m.id,
                "customer_name": m.customer_name,
                "product_name": m.product_name,
                "batch_number": m.batch_number,
                "complaint_date": str(m.created_at),
                "severity": m.severity,
                "status": m.status
            })

    return {
        "is_duplicate": len(duplicates) > 0,
        "count": len(duplicates),
        "matches": duplicates
    }


# --------------------------------------------------
# PRESET SAMPLE COMPLAINTS FOR DEMO
# --------------------------------------------------

@app.get("/complaints/samples")
def get_sample_complaints():
    return [
        {
            "id": "sample-1",
            "title": "Foreign Matter in Metformin API Drum",
            "filename": "Metformin_Foreign_Matter_Report.pdf",
            "source": "Incoming Quality Inspection",
            "text": "ABC Formulations Ltd. reported multiple dark foreign particles inside one sealed HDPE drum during incoming quality inspection. Batch number: CHG 260712A. Product: Metformin Hydrochloride API (IP/BP). Affected quantity: 50 kg (2 HDPE Drum). Manufacturing date: 25 June 2026. Expiry date: Not Provided. Originating site: Manufacturing. Impacted NPM: Secondary Packaging (HDPE Drum)."
        },
        {
            "id": "sample-2",
            "title": "Discolored Capsules - Amoxicillin 500mg",
            "filename": "Amoxicillin_Discoloration_Email.eml",
            "source": "Pharmacy Email",
            "text": "Apollo Pharmacy reported discolored capsules in Amoxicillin Capsules 500 mg. Batch number AMX240602. Manufacturing date March 2026. Expiry date February 2028. Quantity affected: 12 capsules found discolored inside sealed bottle. Originating site: Manufacturing. Impacted NPM: Primary Packaging (Bottle). Please log this complaint."
        },
        {
            "id": "sample-3",
            "title": "Leaking IV Infusion Bag - Paracetamol 100ml",
            "filename": "IV_Bag_Leakage_Notice.txt",
            "source": "Hospital QA Department",
            "text": "City Central Hospital QA reported micro-pinhole leaks in 5 units of Paracetamol 100ml IV Infusion Bags from Batch PAR2026-09. Manufacturing date: January 2026. Expiry date: December 2027. Originating site: Packaging Line 2. Impacted NPM: Primary IV Overwrap Foil."
        }
    ]


# --------------------------------------------------
# CREATE COMPLAINT (COMMIT TO QMS LEDGER)
# --------------------------------------------------

@app.post("/complaints", response_model=ComplaintWithAIResponse)
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db)
):
    new_complaint = Complaint(
        complaint_source=complaint.complaint_source,
        customer_name=complaint.customer_name,
        product_name=complaint.product_name,
        product_strength=complaint.product_strength,
        batch_number=complaint.batch_number,
        affected_quantity=complaint.affected_quantity,
        manufacturing_date=complaint.manufacturing_date,
        expiry_date=complaint.expiry_date,
        originating_site_block=complaint.originating_site_block,
        impacted_npm=complaint.impacted_npm,
        complaint_type=complaint.complaint_type,
        complaint_date=complaint.complaint_date,
        complaint_description=complaint.complaint_description or "Customer complaint logged into QMS Ledger.",
        category=complaint.category or "General Complaint",
        sentiment=complaint.sentiment or "Negative",
        priority=complaint.priority or "High",
        severity=complaint.severity or "Critical",
        suggested_next_action=complaint.suggested_next_action or "Quarantine stock and initiate investigation.",
        initial_risk_assessment=complaint.initial_risk_assessment or "Potential defect requiring root cause investigation.",
        root_cause_recommendation=complaint.root_cause_recommendation,
        capa_recommendation=complaint.capa_recommendation,
        completeness_score=complaint.completeness_score or 100,
        executive_summary=complaint.executive_summary
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    ai_dict = {
        "category": new_complaint.category,
        "sentiment": new_complaint.sentiment,
        "severity": new_complaint.severity,
        "priority": new_complaint.priority,
        "suggested_next_action": new_complaint.suggested_next_action,
        "initial_risk_assessment": new_complaint.initial_risk_assessment,
        "root_cause_recommendation": new_complaint.root_cause_recommendation,
        "capa_recommendation": new_complaint.capa_recommendation,
        "completeness_score": new_complaint.completeness_score,
        "executive_summary": new_complaint.executive_summary
    }

    return {
        "complaint": new_complaint,
        "ai_analysis": ai_dict
    }


# --------------------------------------------------
# GET ALL COMPLAINTS
# --------------------------------------------------

@app.get("/complaints", response_model=list[ComplaintResponse])
def get_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).order_by(Complaint.id.desc()).all()


# --------------------------------------------------
# GET SINGLE COMPLAINT
# --------------------------------------------------

@app.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


# --------------------------------------------------
# UPDATE COMPLAINT STATUS
# --------------------------------------------------

@app.put("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = status  # type: ignore
    db.commit()
    db.refresh(complaint)

    return {
        "message": "Complaint status updated successfully",
        "complaint": complaint
    }