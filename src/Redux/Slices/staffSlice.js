import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://restaurant-backend-kiran.up.railway.app/api/staff";

// Async thunks
export const fetchStaff = createAsyncThunk("staff/fetchStaff", async () => {
  const res = await axios.get(API_URL);
  return res.data;
});

export const addStaff = createAsyncThunk(
  "staff/addStaff",
  async (staffData) => {
    const res = await axios.post(API_URL, staffData);
    return res.data;
  }
);

export const updateStaff = createAsyncThunk(
  "staff/updateStaff",
  async ({ id, data }) => {
    await axios.put(`${API_URL}/${id}`, data);
    return { id, data };
  }
);

export const deleteStaff = createAsyncThunk("staff/deleteStaff", async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

// Slice
const staffSlice = createSlice({
  name: "staff",
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch staff
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchStaff.rejected, (state) => {
        state.loading = false;
      })

      // Add staff
      .addCase(addStaff.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // Update staff
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.list = state.list.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.data } : s
        );
      })

      // Delete staff
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
      });
  },
});

export default staffSlice.reducer;
