// stockSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch stock from backend
export const fetchStock = createAsyncThunk("stock/fetchStock", async () => {
  const response = await fetch("/api/stock");
  return response.json();
});

const stockSlice = createSlice({
  name: "stock",
  initialState: {
    stockItems: [], // array of stock items
    lowStockAlerts: [], // low stock notifications
    loading: false,
  },
  reducers: {
    // Deduct ingredients from stock when an order starts
    useIngredients: (state, action) => {
      const { ingredients } = action.payload;
      ingredients.forEach((ing) => {
        const item = state.stockItems.find((s) => s.item === ing.name);
        if (item) item.quantity -= ing.qty;
      });
      state.lowStockAlerts = state.stockItems
        .filter((i) => i.quantity <= 5)
        .map((i) => i.item);
    },

    // Restock an item
    restockItem: (state, action) => {
      const { item, qty } = action.payload;
      const stockItem = state.stockItems.find((s) => s.item === item);
      if (stockItem) stockItem.quantity += qty;
      state.lowStockAlerts = state.stockItems
        .filter((i) => i.quantity <= 5)
        .map((i) => i.item);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStock.fulfilled, (state, action) => {
        state.stockItems = action.payload;
        state.lowStockAlerts = state.stockItems
          .filter((i) => i.quantity <= 5)
          .map((i) => i.item);
        state.loading = false;
      })
      .addCase(fetchStock.rejected, (state) => {
        state.loading = false;
      });
  },
});

// Export actions as named exports
export const { useIngredients, restockItem } = stockSlice.actions;

// Default export for the reducer
export default stockSlice.reducer;
