// store.js 
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import csvReducer from "./csvSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    csv: csvReducer,
  },
});

export default store;
