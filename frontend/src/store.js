import { configureStore } from '@reduxjs/toolkit';
import pollReducer from './slices/pollSlice';
import userReducer from './slices/userSlice';
import timerReducer from './slices/timerSlice';
import participantsReducer from './slices/participantsSlice';
import chatReducer from './slices/chatSlice';

const store = configureStore({
  reducer: {
    poll: pollReducer,
    user: userReducer,
    timer: timerReducer,
    participants: participantsReducer,
    chat: chatReducer
  }
});

export default store; 