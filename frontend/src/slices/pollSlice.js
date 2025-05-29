import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activePoll: null,
  pollStatus: 'waiting', // 'waiting', 'active', 'expired', 'completed'
  results: {},
  currentPoll: null,
  studentAnswers: 0,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setActivePoll: (state, action) => {
      state.activePoll = action.payload;
      state.pollStatus = 'active';
      state.results = {};
      state.currentPoll = action.payload;
      state.studentAnswers = 0;
    },
    setPollStatus: (state, action) => {
      state.pollStatus = action.payload;
    },
    setPollResults: (state, action) => {
      state.results = action.payload;
      state.pollStatus = 'completed';
    },
    clearPoll: (state) => {
      state.activePoll = null;
      state.pollStatus = 'waiting';
      state.results = {};
      state.currentPoll = null;
      state.studentAnswers = 0;
    },
    submitAnswer: (state, action) => {
      // action.payload: { pollId, optionIndex, option }
      const { pollId, optionIndex, option } = action.payload;
      
      // For backward compatibility, get the option text if not provided
      const optionText = option || (state.currentPoll?.options[optionIndex] || `Option ${optionIndex + 1}`);
      
      // Initialize results for this poll if not exists
      if (!state.results[optionText]) {
        state.results[optionText] = 0;
      }
      
      // Increment count for this option
      state.results[optionText] += 1;
      
      // Increment total answers count
      state.studentAnswers += 1;
    },
    addPoll: (state, action) => {
      // action.payload: poll object
      state.currentPoll = action.payload;
      state.activePoll = action.payload;
      state.pollStatus = 'active';
      state.results[action.payload.id] = {};
      state.studentAnswers = 0;
    },
    setCurrentPoll: (state, action) => {
      state.currentPoll = action.payload;
  },
  }
});

export const {
  setActivePoll,
  setPollStatus,
  setPollResults,
  clearPoll,
  submitAnswer,
  addPoll,
  setCurrentPoll,
} = pollSlice.actions;
export default pollSlice.reducer; 