import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFormField, resetForm } from '../store/formSlice';
import { addCommittedComplaint, setNotification } from '../store/complaintsSlice';
import { Shield, CheckCircle2, RotateCcw, Send, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8000';

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.form);
  const highlightedFields = useSelector((state) => state.form.highlighted_fields || []);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isFieldHighlighted = (fieldName) => highlightedFields.includes(fieldName);

  const handleChange = (field, value) => {
    dispatch(setFormField({ field, value }));
  };

  const handleCommit = async (e) => {
    e.preventDefault();
    if (!form.customer_name && !form.product_name && !form.complaint_description) {
      alert('Please provide at least a Customer Name or Product Name to commit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        complaint_source: form.complaint_source || 'Customer',
        customer_name: form.customer_name || 'Anonymous Customer',
        product_name: form.product_name || 'Unspecified Product',
        product_strength: form.product_strength || '',
        batch_number: form.batch_number || 'UNKNOWN',
        affected_quantity: form.affected_quantity || '',
        manufacturing_date: form.manufacturing_date || null,
        expiry_date: form.expiry_date || null,
        originating_site_block: form.originating_site_block || 'Manufacturing',
        impacted_npm: form.impacted_npm || '',
        complaint_type: form.category || 'Quality Complaint',
        complaint_date: form.complaint_date || new Date().toISOString().split('T')[0],
        complaint_description: form.complaint_description || 'No detailed description provided.',
        category: form.category || 'General QA Complaint',
        sentiment: form.severity === 'Critical' || form.severity === 'High' ? 'Negative' : 'Neutral',
        severity: form.severity || 'Medium',
        priority: form.priority || 'Medium',
        suggested_next_action: form.suggested_next_action || '',
        initial_risk_assessment: form.initial_risk_assessment || '',
        root_cause_recommendation: form.root_cause_recommendation || '',
        capa_recommendation: form.capa_recommendation || '',
        completeness_score: form.completeness_score || 85,
        executive_summary: form.executive_summary || ''
      };

      const res = await axios.post(`${BACKEND_URL}/complaints`, payload);
      dispatch(addCommittedComplaint(res.data.complaint || res.data));
      dispatch(setNotification({
        type: 'success',
        message: `Complaint #${res.data.complaint?.id || ''} committed to QMS Ledger successfully!`
      }));
      // Note: Retain form data on dashboard after commit per user request until manual reset/refresh
    } catch (err) {
      console.error('Error committing complaint:', err);
      dispatch(setNotification({
        type: 'error',
        message: 'Failed to commit complaint to database. Ensure backend server is running.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Form Header */}
      <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Log Customer Complaint</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">API & FDF Quality Assurance Module</p>
        </div>

        <div className="flex items-center gap-3">
          {form.is_ready_to_commit ? (
            <span className="badge-ready">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ready to Commit
            </span>
          ) : (
            <span className="badge-draft">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Draft Intake
            </span>
          )}

          <button
            type="button"
            onClick={() => dispatch(resetForm())}
            title="Reset Form"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Body - Scrollable */}
      <form onSubmit={handleCommit} className="p-6 overflow-y-auto flex-1 space-y-6">
        
        {/* SECTION 1: ORIGIN & CUSTOMER DETAILS */}
        <div>
          <div className="qms-section-title">
            1. ORIGIN & CUSTOMER DETAILS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="qms-label">Complaint Source</label>
              <input
                type="text"
                placeholder="e.g. Email, Pharmacy, Distributor"
                value={form.complaint_source}
                onChange={(e) => handleChange('complaint_source', e.target.value)}
                className={`qms-input ${isFieldHighlighted('complaint_source') ? 'animate-field-highlight' : ''}`}
              />
            </div>

            <div>
              <label className="qms-label">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. ABC Formulations Ltd."
                value={form.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                className={`qms-input ${isFieldHighlighted('customer_name') ? 'animate-field-highlight' : ''}`}
              />
            </div>

            <div>
              <label className="qms-label">Date of Complaint</label>
              <input
                type="text"
                placeholder="e.g. 25 June 2026"
                value={form.complaint_date}
                onChange={(e) => handleChange('complaint_date', e.target.value)}
                className={`qms-input ${isFieldHighlighted('complaint_date') ? 'animate-field-highlight' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCT & BATCH IDENTIFICATION */}
        <div>
          <div className="qms-section-title">
            2. PRODUCT & BATCH IDENTIFICATION
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="qms-label">Product Name</label>
              <input
                type="text"
                placeholder="e.g. Metformin Hydrochloride API"
                value={form.product_name}
                onChange={(e) => handleChange('product_name', e.target.value)}
                className={`qms-input ${isFieldHighlighted('product_name') ? 'animate-field-highlight' : ''}`}
              />
            </div>

            <div>
              <label className="qms-label">Product Strength/Grade</label>
              <input
                type="text"
                placeholder="e.g. IP/BP, 500 mg"
                value={form.product_strength}
                onChange={(e) => handleChange('product_strength', e.target.value)}
                className={`qms-input ${isFieldHighlighted('product_strength') ? 'animate-field-highlight' : ''}`}
              />
            </div>

            <div>
              <label className="qms-label">Batch / Lot Number</label>
              <input
                type="text"
                placeholder="e.g. CHG 260712A"
                value={form.batch_number}
                onChange={(e) => handleChange('batch_number', e.target.value)}
                className={`qms-input ${isFieldHighlighted('batch_number') ? 'animate-field-highlight' : ''}`}
              />
            </div>

            <div>
              <label className="qms-label">Affected Quantity</label>
              <input
                type="text"
                placeholder="e.g. 50 kg (2 HDPE Drum)"
                value={form.affected_quantity}
                onChange={(e) => handleChange('affected_quantity', e.target.value)}
                className={`qms-input ${isFieldHighlighted('affected_quantity') ? 'animate-field-highlight' : ''}`}
              />
            </div>

            <div>
              <label className="qms-label">Manufacturing Date</label>
              <input
                type="text"
                placeholder="e.g. 25 June 2026"
                value={form.manufacturing_date}
                onChange={(e) => handleChange('manufacturing_date', e.target.value)}
                className={`qms-input ${isFieldHighlighted('manufacturing_date') ? 'animate-field-highlight' : ''}`}
              />
            </div>

            <div>
              <label className="qms-label">Expiry Date</label>
              <input
                type="text"
                placeholder="e.g. Not Provided, Feb 2028"
                value={form.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
                className={`qms-input ${isFieldHighlighted('expiry_date') ? 'animate-field-highlight' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: FACILITY & MATERIAL IMPACT */}
        <div>
          <div className="qms-section-title">
            3. FACILITY & MATERIAL IMPACT
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="qms-label">Originating Site Block</label>
              <select
                value={form.originating_site_block}
                onChange={(e) => handleChange('originating_site_block', e.target.value)}
                className={`qms-input ${isFieldHighlighted('originating_site_block') ? 'animate-field-highlight' : ''}`}
              >
                <option value="Manufacturing">Manufacturing</option>
                <option value="Packaging Line 2">Packaging Line 2</option>
                <option value="API Synthesis Block B">API Synthesis Block B</option>
                <option value="Quality Control Lab">Quality Control Lab</option>
                <option value="Warehouse / Logistics">Warehouse / Logistics</option>
              </select>
            </div>

            <div>
              <label className="qms-label">Impacted Non-Product Materials (NPM)</label>
              <input
                type="text"
                placeholder="e.g. Primary Packaging (Bottle), HDPE Drum"
                value={form.impacted_npm}
                onChange={(e) => handleChange('impacted_npm', e.target.value)}
                className={`qms-input ${isFieldHighlighted('impacted_npm') ? 'animate-field-highlight' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: DEFECT ANALYSIS */}
        <div>
          <div className="qms-section-title">
            4. DEFECT ANALYSIS
          </div>

          <div className="space-y-4">
            <div>
              <label className="qms-label">Complaint Category</label>
              <input
                type="text"
                placeholder="e.g. Foreign Matter Contamination"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`qms-input ${isFieldHighlighted('category') ? 'animate-field-highlight' : ''}`}
              />
            </div>

            <div>
              <label className="qms-label">Complaint Description</label>
              <textarea
                rows={3}
                placeholder="Full details of the complaint reported..."
                value={form.complaint_description}
                onChange={(e) => handleChange('complaint_description', e.target.value)}
                className={`qms-input ${isFieldHighlighted('complaint_description') ? 'animate-field-highlight' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* AI COPILOT RISK ASSESSMENT CONTAINER */}
        <div className="qms-ai-assessment-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-indigo-950">AI copilot risk assessment</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="qms-label">Severity (Suggested)</label>
              <input
                type="text"
                placeholder="e.g. Critical, High, Medium"
                value={form.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                className={`qms-input ${isFieldHighlighted('severity') ? 'animate-field-highlight' : ''}`}
              />
            </div>

            <div>
              <label className="qms-label">Suggested Next Action</label>
              <input
                type="text"
                placeholder="e.g. Laboratory investigation & record review"
                value={form.suggested_next_action}
                onChange={(e) => handleChange('suggested_next_action', e.target.value)}
                className={`qms-input ${isFieldHighlighted('suggested_next_action') ? 'animate-field-highlight' : ''}`}
              />
            </div>
          </div>

          <div>
            <label className="qms-label">Initial Risk Assessment</label>
            <textarea
              rows={2}
              placeholder="Potential foreign matter contamination. High impact to API quality..."
              value={form.initial_risk_assessment}
              onChange={(e) => handleChange('initial_risk_assessment', e.target.value)}
              className={`qms-input ${isFieldHighlighted('initial_risk_assessment') ? 'animate-field-highlight' : ''}`}
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-base shadow-indigo-200"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Committing to QMS Ledger...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Commit to QMS Ledger
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
