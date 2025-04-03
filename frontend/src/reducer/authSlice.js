import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userid: null, // 사용자 정보 저장 (id)
  isSignedIn: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 로그인 액션: payload에 사용자 정보를 받아서 저장
    signin: (state, action) => {
      state.userid = action.payload;
      state.isSignedIn = true;
    },
    signout: (state) => {
      state.userid = null;
      state.isSignedIn = false;
    },
    updateSession: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

// 액션 생성자(export)와 리듀서를 export
export const { signin, signout, updateSession } = authSlice.actions;
export default authSlice.reducer;
