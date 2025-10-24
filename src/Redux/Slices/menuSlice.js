// src/Redux/Slices/menuSlice.js
import { createSlice } from "@reduxjs/toolkit";

const menuSlice = createSlice({
  name: "menu",
  initialState: { items: [] }, // each item: {id, name, price, stock, threshold, status, ...}
  reducers: {
    setMenu: (state, action) => {
      state.items = action.payload; // payload must include stock, threshold, status, price, name, id
    },
    updateMenuItemStock: (state, action) => {
      const { id, stock } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.stock = stock;
      }
    },
    markMenuItemInactive: (state, action) => {
      const id = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) item.status = "Inactive";
    },
  },
});

export const { setMenu, updateMenuItemStock, markMenuItemInactive } =
  menuSlice.actions;
export default menuSlice.reducer;
