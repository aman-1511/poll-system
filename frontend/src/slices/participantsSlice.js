import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  students: [],
  count: 0,
};

const participantsSlice = createSlice({
  name: 'participants',
  initialState,
  reducers: {
    setStudents: (state, action) => {
      state.students = action.payload;
      state.count = action.payload.length;
    },
    addStudent: (state, action) => {
      if (!state.students.find(s => s.name === action.payload.name)) {
        state.students.push(action.payload);
        state.count = state.students.length;
      }
    },
    removeStudent: (state, action) => {
      state.students = state.students.filter(s => s.name !== action.payload);
      state.count = state.students.length;
    },
    clearStudents: (state) => {
      state.students = [];
      state.count = 0;
    },
  },
});

export const { setStudents, addStudent, removeStudent, clearStudents } = participantsSlice.actions;
export default participantsSlice.reducer; 