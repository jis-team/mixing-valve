// ./src/store/csvSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { parseCsv } from "../utils/parseCsv";

export const fetchCsvData = createAsyncThunk(
  "csv/fetchCsvData",
  async (csvPath, { getState, rejectWithValue }) => {
    const state = getState().csv;

    if (state.csvMap[csvPath]) {
      return rejectWithValue("이미 로드된 CSV입니다.");
    }

    try {
      const data = await parseCsv(csvPath);
      return { csvPath, data };
    } catch (err) {
      return rejectWithValue(String(err));
    }
  }
);

const initialState = {
  csvMap: {},       
  loadingMap: {},   
  errorMap: {},     
};

const csvSlice = createSlice({
  name: "csv",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCsvData.pending, (state, action) => {
        const path = action.meta.arg;
        state.loadingMap[path] = true;
        state.errorMap[path] = null;
      })
      .addCase(fetchCsvData.fulfilled, (state, action) => {
        const { csvPath, data } = action.payload;
        state.csvMap[csvPath] = data;
        state.loadingMap[csvPath] = false;
        state.errorMap[csvPath] = null;
      })
      .addCase(fetchCsvData.rejected, (state, action) => {
        const path = action.meta.arg;
        state.loadingMap[path] = false;
        if (action.payload === "이미 로드된 CSV입니다.") {
          return;
        }
        state.errorMap[path] = action.payload || "CSV 로드 실패";
      });
  },
});

export default csvSlice.reducer;