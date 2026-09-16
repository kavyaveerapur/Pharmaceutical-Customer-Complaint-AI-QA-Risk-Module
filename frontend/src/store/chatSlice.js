import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'qms_chat_messages';

const defaultWelcomeMessage = {
  id: 'welcome-1',
  sender: 'assistant',
  iconType: 'zap',
  text: 'Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const loadInitialMessages = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load chat state from localStorage:', e);
  }
  return [defaultWelcomeMessage];
};

const saveMessagesToStorage = (messages) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat state to localStorage:', e);
  }
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: loadInitialMessages(),
    isProcessing: false,
    uploadProgress: 0,
    duplicateWarning: null
  },
  reducers: {
    addMessage: (state, action) => {
      const newMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...action.payload
      };
      state.messages.push(newMsg);
      saveMessagesToStorage(state.messages);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
      saveMessagesToStorage(state.messages);
    },
    setProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setDuplicateWarning: (state, action) => {
      state.duplicateWarning = action.payload;
    },
    resetChat: (state) => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      state.messages = [defaultWelcomeMessage];
      state.isProcessing = false;
      state.duplicateWarning = null;
    }
  }
});

export const { addMessage, setMessages, setProcessing, setUploadProgress, setDuplicateWarning, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
