import { configureStore } from '@reduxjs/toolkit';
import formReducer from './formSlice';
import chatReducer from './chatSlice';
import complaintsReducer from './complaintsSlice';

export const store = configureStore({
  reducer: {
    form: formReducer,
    chat: chatReducer,
    complaints: complaintsReducer
  }
});
