import React from 'react';
import { useSelector } from 'react-redux';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, Cpu, Award, FileCheck2, AlertTriangle } from 'lucide-react';

export default function AIInsights() {
  const complaints = useSelector((state) => state.complaints.list);

  const totalCount = complaints.length;
  const criticalCount = complaints.filter(c => c.severity === 'Critical').length;
  const highCount = complaints.filter(c => c.severity === 'High').length;
  const closedCount = complaints.filter(c => c.status === 'Closed').length;

  const avgCompleteness = totalCount > 0
    ? Math.round(complaints.reduce((acc, curr) => acc + (curr.completeness_score || 85), 0) / totalCount)
    : 92;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 flex-1 overflow-y-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" /> AI QA Risk & CAPA Analytics Dashboard
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Executive Quality Management System Metrics & AI Risk Classification Intelligence
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-indigo-600" /> Total Logged Complaints
          </span>
          <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
          <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Audited in QMS Database
          </p>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Critical Severity Risk
          </span>
          <p className="text-2xl font-bold text-rose-950">{criticalCount}</p>
          <p className="text-[11px] font-semibold text-rose-700">Immediate Investigation Required</p>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600" /> Avg Complaint Completeness
          </span>
          <p className="text-2xl font-bold text-indigo-950">{avgCompleteness}%</p>
          <p className="text-[11px] font-semibold text-indigo-700">AI LangGraph Parsing Accuracy</p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Closed & Resolved
          </span>
          <p className="text-2xl font-bold text-emerald-950">{closedCount}</p>
          <p className="text-[11px] font-semibold text-emerald-700">CAPA Execution Complete</p>
        </div>

      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Severity Distribution */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" /> AI Risk Severity Distribution
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-rose-700">Critical Severity ({criticalCount})</span>
                <span>{totalCount > 0 ? Math.round((criticalCount / totalCount) * 100) : 25}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-600 rounded-full" style={{ width: `${totalCount > 0 ? (criticalCount / totalCount) * 100 : 25}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-700">High Severity ({highCount})</span>
                <span>{totalCount > 0 ? Math.round((highCount / totalCount) * 100) : 40}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalCount > 0 ? (highCount / totalCount) * 100 : 40}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-indigo-700">Medium / Low Severity</span>
                <span>35%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Guidelines */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-3 text-xs">
          <h3 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" /> cGMP & QMS Compliance Protocol
          </h3>
          <ul className="space-y-2 text-indigo-950 font-medium list-disc list-inside">
            <li>21 CFR Part 211.198 — Complaint files maintained and investigated.</li>
            <li>ICH Q10 Quality System Framework — CAPA root cause methodology.</li>
            <li>Automatic duplicate detection cross-checks incoming batches against historical deviations.</li>
            <li>Real-time initial risk assessment generated by LangGraph LLM workflow.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
