import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setComplaintsList, setSelectedComplaint, setSearchQuery, setStatusFilter, setSeverityFilter, updateComplaintInList } from '../store/complaintsSlice';
import { Search, Filter, Eye, Database, CheckCircle, Clock, ShieldAlert, ArrowUpDown, X, FileText, Activity } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8000';

export default function QMSLedger() {
  const dispatch = useDispatch();
  const complaints = useSelector((state) => state.complaints.list);
  const searchQuery = useSelector((state) => state.complaints.searchQuery);
  const statusFilter = useSelector((state) => state.complaints.statusFilter);
  const severityFilter = useSelector((state) => state.complaints.severityFilter);
  const selectedComplaint = useSelector((state) => state.complaints.selectedComplaint);

  const [isLoading, setIsLoading] = useState(false);

  // Fetch complaints list on mount
  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/complaints`);
      dispatch(setComplaintsList(res.data || []));
    } catch (err) {
      console.error('Failed to fetch complaints list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/complaints/${id}/status?status=${newStatus}`);
      dispatch(updateComplaintInList(res.data.complaint));
      if (selectedComplaint && selectedComplaint.id === id) {
        dispatch(setSelectedComplaint(res.data.complaint));
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Filter complaints list with intelligent natural language multi-term search
  const filteredList = complaints.filter((item) => {
    let matchesSearch = true;
    if (searchQuery && searchQuery.trim()) {
      const terms = searchQuery.toLowerCase().trim().split(/\s+/);
      const combinedText = [
        item.customer_name,
        item.product_name,
        item.batch_number,
        item.category,
        item.complaint_description,
        item.complaint_source,
        item.severity,
        item.status,
        item.complaint_date,
        item.originating_site_block,
        item.executive_summary,
        item.suggested_next_action,
        item.initial_risk_assessment
      ].filter(Boolean).join(' ').toLowerCase();

      matchesSearch = terms.every(term => combinedText.includes(term));
    }

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Ledger Header & Search Controls */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" /> QMS Complaint Ledger
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Audited Database Ledger of Committed Pharmaceutical Quality Complaints
            </p>
          </div>

          <button
            onClick={fetchComplaints}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer"
          >
            🔄 Refresh Records
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, product, batch #, category, text..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="qms-input pl-9 text-xs"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => dispatch(setStatusFilter(e.target.value))}
              className="qms-input text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="CAPA Assigned">CAPA Assigned</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => dispatch(setSeverityFilter(e.target.value))}
              className="qms-input text-xs"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto flex-1 p-6">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">
            Loading QMS Ledger records...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Database className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm">No complaints match your criteria</p>
            <p className="text-xs text-slate-400">Log a new complaint using the Intake Form or clear filters.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Batch / Lot #</th>
                <th className="py-3 px-4">Complaint Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">#{item.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{item.customer_name || 'N/A'}</td>
                  <td className="py-3.5 px-4">{item.product_name || 'N/A'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{item.batch_number || 'N/A'}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{item.complaint_date || (item.created_at ? String(item.created_at).split('T')[0] : 'N/A')}</td>
                  <td className="py-3.5 px-4">{item.category || 'QA Defect'}</td>
                  <td className="py-3.5 px-4">
                    <span className={getSeverityBadgeClass(item.severity)}>
                      {item.severity || 'Medium'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="CAPA Assigned">CAPA Assigned</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => dispatch(setSelectedComplaint(item))}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* COMPLAINT DETAIL VIEW MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  Record #{selectedComplaint.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedComplaint.product_name} — {selectedComplaint.customer_name}
                </h3>
              </div>
              <button
                onClick={() => dispatch(setSelectedComplaint(null))}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Batch Number</span>
                  <p className="font-mono font-bold text-indigo-700">{selectedComplaint.batch_number}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Complaint Date</span>
                  <p className="font-semibold text-slate-800">{selectedComplaint.complaint_date || (selectedComplaint.created_at ? String(selectedComplaint.created_at).split('T')[0] : 'N/A')}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Affected Qty</span>
                  <p className="font-semibold text-slate-800">{selectedComplaint.affected_quantity || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Severity</span>
                  <p><span className={getSeverityBadgeClass(selectedComplaint.severity)}>{selectedComplaint.severity}</span></p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                  <p className="font-bold text-slate-800">{selectedComplaint.status}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Complaint Description:</span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed mt-1">
                  {selectedComplaint.complaint_description}
                </p>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" /> AI Risk Assessment & CAPA Recommendations
                </h4>

                <div>
                  <span className="font-semibold text-indigo-900">Suggested Next Action:</span>
                  <p className="text-indigo-950 mt-0.5">{selectedComplaint.suggested_next_action}</p>
                </div>

                <div>
                  <span className="font-semibold text-indigo-900">Initial Risk Assessment:</span>
                  <p className="text-indigo-950 mt-0.5">{selectedComplaint.initial_risk_assessment}</p>
                </div>

                {selectedComplaint.root_cause_recommendation && (
                  <div>
                    <span className="font-semibold text-indigo-900">Probable Root Cause:</span>
                    <p className="text-indigo-950 mt-0.5">{selectedComplaint.root_cause_recommendation}</p>
                  </div>
                )}

                {selectedComplaint.capa_recommendation && (
                  <div>
                    <span className="font-semibold text-indigo-900">CAPA Action Plan:</span>
                    <p className="text-indigo-950 bg-white p-2.5 rounded-lg border border-indigo-200 font-medium mt-0.5">
                      {selectedComplaint.capa_recommendation}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => dispatch(setSelectedComplaint(null))}
                className="btn-primary py-2 px-6 text-xs"
              >
                Close Record
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
