// ./src/store/dataSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchRaw, fetchStats } from "../utils/fetchUtils";

export const _fetchRaw = createAsyncThunk(
  "data/_fetchRaw",
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchRaw(params);
      return { key: params.key, data };
    } catch (err) {
      return rejectWithValue(String(err));
    }
  }
);

export const _fetchStats = createAsyncThunk(
  "data/_fetchStats",
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchStats(params);
      return { key: params.key, data };
    } catch (err) {
      return rejectWithValue(String(err));
    }
  }
);

const dataSlice = createSlice({
  name: "data",
  initialState: {
    rawMap: {},
    statsMap: {},
    loadingMap: {},
    errorMap: {},
  },
  reducers: {},
  extraReducers: (builder) => {

    builder
      .addCase(_fetchRaw.pending, (state, action) => {
        const { key } = action.meta.arg;
        state.loadingMap[key] = true;
        state.errorMap[key] = null;
      })
      .addCase(_fetchRaw.fulfilled, (state, action) => {
        const { key, data } = action.payload;
        state.rawMap[key] = data;
        state.loadingMap[key] = false;
        state.errorMap[key] = null;
      })
      .addCase(_fetchRaw.rejected, (state, action) => {
        const { key } = action.meta.arg;
        state.loadingMap[key] = false;
        state.errorMap[key] = action.payload || "DB 로드 실패";
      });

    builder
      .addCase(_fetchStats.pending, (state, action) => {
        const { key } = action.meta.arg;
        state.loadingMap[key] = true;
        state.errorMap[key] = null;
      })
      .addCase(_fetchStats.fulfilled, (state, action) => {
        const { key, data } = action.payload;
        state.statsMap[key] = data;
        state.loadingMap[key] = false;
        state.errorMap[key] = null;
      })
      .addCase(_fetchStats.rejected, (state, action) => {
        const { key } = action.meta.arg;
        state.loadingMap[key] = false;
        state.errorMap[key] = action.payload || "DB 로드 실패";
      });
  },
});


export default dataSlice.reducer;