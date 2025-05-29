import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  role: '', // 'student' or 'teacher'
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.name = action.payload.name;
      state.role = action.payload.role;
    },
    setName(state, action) {
      state.name = action.payload;
    },
    clearUser: (state) => {
      state.name = '';
      state.role = '';
    },
  },
});

export const { setUser, setName, clearUser } = userSlice.actions;
export default userSlice.reducer; 