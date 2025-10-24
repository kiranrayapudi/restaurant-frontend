import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Orders from "./Pages/Orders";
import Kitchen from "./Pages/Kitchen";
import Billing from "./Pages/Billing";
import HomePage from "./Pages/Homepage";
import UserMenu from "./Pages/UserMenu";
import MenuItems from "./Pages/MenuItems";
import StaffAdmin from "./Pages/StaffAdmin";
import StaffDashboard from "./Pages/Staff/StaffDashboard";
import KitchenDashboard from "./Pages/Kitchen/KitchenDashboard";
import ItemsPage from "./Pages/Items";
import StockPage from "./Pages/Stock";
import OrderItemsPage from "./Pages/OrderItemsPage";
import TablesPage from "./Pages/TablesPage";
import VendorsPage from "./Pages/Vendors";
import ManageStock from "./Pages/Kitchen/ManageStock";
import ContactsAdmin from "./Pages/ContactsAdmin";

// import QRScanner from "./Pages/QRScanner";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" />
      <Routes>
        {/* Root always goes to Home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Public Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/usermenu" element={<UserMenu />} />
        <Route path="/menuitems" element={<MenuItems />} />
        {/* <Route path="/qr" element={<QRScanner />} /> */}

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoute>
              <TablesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute>
              <Kitchen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <ProtectedRoute>
              <VendorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stocks"
          element={
            <ProtectedRoute>
              <StockPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <ItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase"
          element={
            <ProtectedRoute>
              <OrderItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staffAdmin"
          element={
            <ProtectedRoute>
              <StaffAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-dashboard"
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen-dashboard"
          element={
            <ProtectedRoute>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-stock"
          element={
            <ProtectedRoute>
              <ManageStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <ContactsAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
