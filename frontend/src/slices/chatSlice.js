import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  isOpen: false,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      if (!state.isOpen) {
        state.unreadCount += 1;
      }
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      if (state.isOpen) {
        state.unreadCount = 0;
      }
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
    },
    clearChat: (state) => {
      state.messages = [];
      state.unreadCount = 0;
    },
  },
});

export const { addMessage, toggleChat, clearUnread, clearChat } = chatSlice.actions;
export default chatSlice.reducer;