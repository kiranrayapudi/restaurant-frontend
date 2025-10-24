import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slices/authSlice";
import orderReducer from "./Slices/orderSlice";
import stockReducer from "./Slices/stockSlice";
import menuReducer from "./Slices/menuSlice";
import vendorReducer from "./Slices/vendorSlice";
import itemReducer from "./Slices/itemSlice";
import staffReducer from "./Slices/staffSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    stock: stockReducer,
    menu: menuReducer,
    vendors: vendorReducer,
    items: itemReducer,
    staff: staffReducer,
  },
});
