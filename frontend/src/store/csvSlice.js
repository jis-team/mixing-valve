// ./src/store/csvSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDbTable } from "../utils/fetchDbTable";

export const fetchTableData = createAsyncThunk(
  "csv/fetchTableData",
  async (tableName, { getState, rejectWithValue }) => {
    const state = getState().csv;
    if (state.csvMap[tableName]) {
      return rejectWithValue("이미 로드된 테이블입니다.");
    }

    try {
      // 백엔드 API 호출
      const data = await fetchDbTable(tableName);
      return { tableName, data };
    } catch (err) {
      return rejectWithValue(String(err));
    }
  }
);

const initialState = {
  csvMap: {},       // { [tableName]: [ { datetime, ...}, ...] }
  loadingMap: {},   // { [tableName]: boolean }
  errorMap: {},     // { [tableName]: string|null }
};

const csvSlice = createSlice({
  name: "csv",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTableData.pending, (state, action) => {
        const tblName = action.meta.arg;
        state.loadingMap[tblName] = true;
        state.errorMap[tblName] = null;
      })
      .addCase(fetchTableData.fulfilled, (state, action) => {
        const { tableName, data } = action.payload;
        state.csvMap[tableName] = data;
        state.loadingMap[tableName] = false;
        state.errorMap[tableName] = null;
      })
      .addCase(fetchTableData.rejected, (state, action) => {
        const tblName = action.meta.arg;
        state.loadingMap[tblName] = false;

        if (action.payload === "이미 로드된 테이블입니다.") {
          return;
        }
        state.errorMap[tblName] = action.payload || "DB 로드 실패";
      });
  },
});

export default csvSlice.reducer;
