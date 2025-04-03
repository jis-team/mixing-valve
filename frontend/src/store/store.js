// store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
/**
 * localStorage에 저장하고 싶으면
 * import storage from 'redux-persist/lib/storage
 * session Storage에 저장하고 싶으면
 * import storageSession from 'redux-persist/lib/storage/session
 */

import storage from "redux-persist/lib/storage"; // localStorage 사용
import authReducer from "../reducer/authSlice";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
});

export const persistor = persistStore(store);
export default store;
