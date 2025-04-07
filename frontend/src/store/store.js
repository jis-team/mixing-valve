// store.js 
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,        // 직접 authReducer를
  },
});

export default store;
