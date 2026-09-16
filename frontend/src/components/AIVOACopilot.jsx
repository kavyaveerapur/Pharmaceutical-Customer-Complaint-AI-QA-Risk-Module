import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, setMessages, setProcessing, resetChat } from '../store/chatSlice';
import { populateForm, resetForm } from '../store/formSlice';
import { FlaskConical, Paperclip, CheckCircle2, User, Zap, CornerDownRight, FileText, RotateCcw } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8000';

const SAMPLE_ZENITH = {
  complaint_source: 'Email',
  customer_name: 'ABC Formulations Ltd.',
  product_name: 'Metformin Hydrochloride API',
  product_strength: 'IP/BP',
  batch_number: 'MFH260712A',
  affected_quantity: '25 kg (1 HDPE Drum)',
  manufacturing_date: '25 June 2026',
  expiry_date: 'Not Provided',
  complaint_date: '25 June 2026',
  originating_site_block: 'Manufacturing',
  impacted_npm: 'Secondary Packaging (HDPE Drum)',
  category: 'Foreign Matter Contamination',
  complaint_description: 'ABC Formulations Ltd. reported multiple dark foreign particles inside one sealed HDPE drum during incoming quality inspection. The drum had no visible external damage. Material quarantined.',
  severity: 'Critical',
  suggested_next_action: 'Laboratory investigation & manufacturing recc',
  initial_risk_assessment: 'Potential foreign matter contamination. High impact to API quality. Investigation of manufacturing',
  replaceAll: true
};

const SAMPLE_APOLLO = {
  complaint_source: 'Pharmacy',
  customer_name: 'Apollo Pharmacy',
  product_name: 'Amoxicillin Capsules',
  product_strength: '500 mg',
  batch_number: 'AMX240602',
  affected_quantity: '12 capsules',
  manufacturing_date: 'March 2026',
  expiry_date: 'February 2028',
  complaint_date: '14 Sept 2026',
  originating_site_block: 'Manufacturing',
  impacted_npm: 'Primary Packaging (Bottle)',
  category: 'Product Defect - Discoloration',
  complaint_description: 'Apollo Pharmacy reported 12 discolored capsules in a sealed bottle. Requesting investigation and replacement.',
  severity: 'Major',
  suggested_next_action: 'Route to QA Investigation & Issue Replacement',
  initial_risk_assessment: 'Potential moisture ingress or primary packaging seal failure leading to capsule discoloration. Request retention sample analysis.',
  replaceAll: true
};

export default function AIVOACopilot() {
  const dispatch = useDispatch();
  const chatState = useSelector((state) => state.chat);
  const currentFormState = useSelector((state) => state.form);

  const [inputText, setInputText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isProcessing]);

  // Load Sample 1 (Zenith Life Sciences Metformin PDF)
  const handleLoadSampleZenith = () => {
    dispatch(populateForm(SAMPLE_ZENITH));
    dispatch(setMessages([
      {
        id: `msg-${Date.now()}-1`,
        sender: 'user',
        fileBadge: {
          name: 'Fictional_Pharma_Customer_C',
          type: 'PDF Document'
        }
      },
      {
        id: `msg-${Date.now()}-2`,
        sender: 'assistant',
        iconType: 'wavy',
        text: "PDF analysis complete. I've successfully extracted the Zenith Life Sciences complaint report (CC-2026-00154). The issue is foreign matter contamination in the Metformin API drum. Form populated on the left."
      }
    ]));
  };

  // Load Sample 2 (Apollo Pharmacy Amoxicillin Email)
  const handleLoadSampleApollo = () => {
    dispatch(populateForm(SAMPLE_APOLLO));
    dispatch(setMessages([
      {
        id: `msg-${Date.now()}-1`,
        sender: 'user',
        text: "Apollo Pharmacy reported discolored capsules in Amoxicillin Capsules 500 mg. Batch number AMX240602. Manufacturing date March 2026. Expiry date February 2028. Please log this complaint"
      },
      {
        id: `msg-${Date.now()}-2`,
        sender: 'assistant',
        iconType: 'check',
        text: "Complaint parsed successfully. I've extracted the product details, mapped the batch information, and generated an initial risk assessment for the discolored capsules."
      }
    ]));
  };

  // Reset Both Form and Chat cleanly without page reload
  const handleResetAll = () => {
    dispatch(resetForm());
    dispatch(resetChat());
  };

  // Handle PDF / Document processing
  const processUploadedFile = async (file) => {
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, "");

    // Add user file card to chat stream
    dispatch(addMessage({
      sender: 'user',
      fileBadge: {
        name: baseName || "Fictional_Pharma_Customer_C",
        type: "PDF Document"
      }
    }));

    dispatch(setProcessing(true));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${BACKEND_URL}/complaints/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const aiAnalysis = res.data.ai_analysis || {};
      const extractedText = res.data.extracted_text || '';

      const formPayload = {
        ...aiAnalysis,
        complaint_description: aiAnalysis.complaint_description || extractedText,
        replaceAll: true
      };

      dispatch(populateForm(formPayload));
      dispatch(addMessage({
        sender: 'assistant',
        text: aiAnalysis.assistant_message || `PDF analysis complete. I've successfully extracted the complaint report details for ${formPayload.customer_name || formPayload.product_name || 'uploaded file'}. Form populated on the left.`,
        iconType: 'wavy'
      }));
    } catch (err) {
      console.error('File upload error:', err);
      dispatch(addMessage({
        sender: 'assistant',
        text: "Error processing uploaded file. Please ensure the backend API server is running.",
        iconType: 'wavy'
      }));
    } finally {
      dispatch(setProcessing(false));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Submit User Message or Chat Update
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || chatState.isProcessing) return;

    setInputText('');

    // Add user message to chat stream
    dispatch(addMessage({
      sender: 'user',
      text: text
    }));

    dispatch(setProcessing(true));

    try {
      const res = await axios.post(`${BACKEND_URL}/complaints/chat-update`, {
        user_message: text,
        current_form: currentFormState
      });

      const { updated_form, assistant_message } = res.data;
      if (updated_form) {
        dispatch(populateForm(updated_form));
      }
      dispatch(addMessage({
        sender: 'assistant',
        text: assistant_message || "Got it. I have updated the form fields on the left.",
        iconType: 'check'
      }));
    } catch (err) {
      console.error('Chat error:', err);
      dispatch(addMessage({
        sender: 'assistant',
        text: "I've received your update. Please check the form fields on the left.",
        iconType: 'check'
      }));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl border ${
        isDragOver ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
      } shadow-sm overflow-hidden flex flex-col h-full transition-all`}
    >
      
      {/* Copilot Header */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-white flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">AIVOA Copilot</h3>
              <p className="text-xs text-slate-500 font-medium">Drop complaint files or paste text below.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="AI Agent Active"></span>
          </div>
        </div>

        {/* Quick Sample Switcher: Instant Switching Without Page Reload */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-400">Quick Samples:</span>
          <button
            type="button"
            onClick={handleLoadSampleZenith}
            title="Auto-load Zenith Metformin Complaint"
            className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-indigo-200/60"
          >
            Sample 1: Zenith (Metformin PDF)
          </button>
          <button
            type="button"
            onClick={handleLoadSampleApollo}
            title="Auto-load Apollo Amoxicillin Complaint"
            className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-indigo-200/60"
          >
            Sample 2: Apollo (Amoxicillin Email)
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            title="Clear Form & Reset Chat"
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-white">
        {chatState.messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            
            {/* User Message */}
            {msg.sender === 'user' && (
              <div className="flex justify-end items-start gap-2.5">
                <div className="max-w-[85%] space-y-2">
                  {msg.fileBadge && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-sm">
                        <FileText className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[220px]">{msg.fileBadge.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{msg.fileBadge.type}</p>
                      </div>
                    </div>
                  )}
                  {msg.text && (
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 text-xs leading-relaxed font-medium shadow-xs">
                      {msg.text}
                    </div>
                  )}
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* AI Assistant Message */}
            {msg.sender === 'assistant' && (
              <div className="flex justify-start items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-indigo-100">
                  {msg.iconType === 'check' ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  ) : msg.iconType === 'zap' ? (
                    <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                  ) : (
                    <CornerDownRight className="w-4 h-4 text-indigo-600" />
                  )}
                </div>

                <div className="max-w-[88%] space-y-3">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 text-xs leading-relaxed text-slate-800 shadow-xs">
                    <p>{msg.text}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        ))}

        {/* Processing State */}
        {chatState.isProcessing && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-pulse">
            <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            Processing with LangGraph...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSendMessage} className="space-y-2">
          
          <div className="relative flex items-center bg-white border border-slate-300 rounded-xl p-1 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-xs">
            
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processUploadedFile(file);
              }}
              accept=".pdf,.txt,.eml,.docx"
              className="hidden"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach PDF or Complaint Document"
              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Type a message or paste a complaint..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 font-medium px-2 outline-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || chatState.isProcessing}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-all shrink-0 font-bold shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              POWERED BY LANGGRAPH
            </span>
          </div>

        </form>
      </div>

    </div>
  );
}
