import { createSlice } from "@reduxjs/toolkit";

const vendorSlice = createSlice({
  name: "vendors",
  initialState: {
    vendorList: [],
  },
  reducers: {
    addVendor: (state, action) => {
      state.vendorList.push({ id: Date.now(), ...action.payload });
    },
    updateVendor: (state, action) => {
      const index = state.vendorList.findIndex(v => v.id === action.payload.id);
      if (index !== -1) state.vendorList[index] = action.payload;
    },
    deleteVendor: (state, action) => {
      state.vendorList = state.vendorList.filter(v => v.id !== action.payload);
    },
  },
});

export const { addVendor, updateVendor, deleteVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
