import { createSlice } from "@reduxjs/toolkit";

const itemSlice = createSlice({
  name: "items",
  initialState: {
    itemList: [],
  },
  reducers: {
    addItem: (state, action) => {
      state.itemList.push({ id: Date.now(), ...action.payload });
    },
    updateItem: (state, action) => {
      const index = state.itemList.findIndex(i => i.id === action.payload.id);
      if (index !== -1) state.itemList[index] = action.payload;
    },
    deleteItem: (state, action) => {
      state.itemList = state.itemList.filter(i => i.id !== action.payload);
    },
    updateStock: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.itemList.find(i => i.id === id);
      if (item) item.quantity += qty;
    },
  },
});

export const { addItem, updateItem, deleteItem, updateStock } = itemSlice.actions;
export default itemSlice.reducer;
