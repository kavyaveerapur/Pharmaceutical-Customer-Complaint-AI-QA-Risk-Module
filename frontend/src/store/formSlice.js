import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'qms_form_state';

const defaultFormState = {
  complaint_source: '',
  customer_name: '',
  product_name: '',
  product_strength: '',
  batch_number: '',
  affected_quantity: '',
  manufacturing_date: '',
  expiry_date: '',
  complaint_date: '',
  originating_site_block: 'Manufacturing',
  impacted_npm: '',
  category: '',
  complaint_description: '',
  severity: '',
  priority: '',
  suggested_next_action: '',
  initial_risk_assessment: '',
  root_cause_recommendation: '',
  capa_recommendation: '',
  completeness_score: 0,
  executive_summary: '',
  is_ready_to_commit: false,
  highlighted_fields: []
};

// Load saved state from localStorage if available
const loadInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultFormState, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load form state from localStorage:', e);
  }
  return defaultFormState;
};

const saveStateToStorage = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save form state to localStorage:', e);
  }
};

const formSlice = createSlice({
  name: 'form',
  initialState: loadInitialState(),
  reducers: {
    setFormField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
      state.is_ready_to_commit = true;
      saveStateToStorage(state);
    },
    populateForm: (state, action) => {
      const data = action.payload || {};
      const updatedKeys = [];

      if (data.replaceAll) {
        Object.keys(defaultFormState).forEach(k => {
          if (k !== 'is_ready_to_commit' && k !== 'highlighted_fields') {
            state[k] = defaultFormState[k];
          }
        });
      }

      const fieldNames = [
        'complaint_source', 'customer_name', 'product_name', 'product_strength',
        'batch_number', 'affected_quantity', 'manufacturing_date', 'expiry_date',
        'complaint_date', 'originating_site_block', 'impacted_npm', 'category',
        'complaint_description', 'severity', 'priority', 'suggested_next_action',
        'initial_risk_assessment', 'root_cause_recommendation', 'capa_recommendation',
        'completeness_score', 'executive_summary'
      ];

      fieldNames.forEach(field => {
        if (data[field] !== undefined) {
          state[field] = data[field] || '';
          updatedKeys.push(field);
        }
      });

      state.is_ready_to_commit = true;
      state.highlighted_fields = updatedKeys;
      saveStateToStorage(state);
    },
    clearHighlights: (state) => {
      state.highlighted_fields = [];
      saveStateToStorage(state);
    },
    resetForm: (state) => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      return defaultFormState;
    }
  }
});

export const { setFormField, populateForm, clearHighlights, resetForm } = formSlice.actions;
export default formSlice.reducer;
