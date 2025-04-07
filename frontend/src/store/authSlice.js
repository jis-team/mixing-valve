import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,      // 사용자 정보 (id, name 등)
  isSignedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signInSuccess: (state, action) => {
      state.user = action.payload; // user 객체
      state.isSignedIn = true;
    },
    signOutSuccess: (state) => {
      state.user = null;
      state.isSignedIn = false;
    },
    updateSession: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { signInSuccess, signOutSuccess, updateSession } = authSlice.actions;
export default authSlice.reducer;
