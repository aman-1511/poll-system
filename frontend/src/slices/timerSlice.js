import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  timeLeft: 0,
  timeLimit: 0,
  running: false,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setTimeLimit: (state, action) => {
      state.timeLimit = action.payload;
      state.timeLeft = action.payload;
    },
    startTimer: (state) => {
      state.running = true;
    },
    tick: (state) => {
      if (state.running && state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
      if (state.timeLeft <= 0) {
        state.running = false;
      }
    },
    stopTimer: (state) => {
      state.running = false;
    },
    resetTimer: (state) => {
      state.timeLeft = state.timeLimit;
      state.running = false;
    },
  },
});

export const { setTimeLimit, startTimer, tick, stopTimer, resetTimer } = timerSlice.actions;
export default timerSlice.reducer; 