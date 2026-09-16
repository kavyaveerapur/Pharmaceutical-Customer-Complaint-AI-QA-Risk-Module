import { createSlice } from '@reduxjs/toolkit';

const initialComplaintsState = {
  activeTab: 'intake', // 'intake' | 'ledger' | 'insights'
  list: [],
  selectedComplaint: null,
  searchQuery: '',
  statusFilter: 'ALL',
  severityFilter: 'ALL',
  isLoading: false,
  notification: null
};

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: initialComplaintsState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setComplaintsList: (state, action) => {
      state.list = action.payload;
    },
    addCommittedComplaint: (state, action) => {
      state.list.unshift(action.payload);
    },
    updateComplaintInList: (state, action) => {
      const updated = action.payload;
      const index = state.list.findIndex(item => item.id === updated.id);
      if (index !== -1) {
        state.list[index] = updated;
      }
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setSeverityFilter: (state, action) => {
      state.severityFilter = action.payload;
    },
    setNotification: (state, action) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    }
  }
});

export const {
  setActiveTab,
  setComplaintsList,
  addCommittedComplaint,
  updateComplaintInList,
  setSelectedComplaint,
  setSearchQuery,
  setStatusFilter,
  setSeverityFilter,
  setNotification,
  clearNotification
} = complaintsSlice.actions;

export default complaintsSlice.reducer;
