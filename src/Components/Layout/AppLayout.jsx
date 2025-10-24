// src/Components/Layout/AppLayout.jsx
import React from "react";
import { Layout, Menu, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/Slices/authSlice";
import { toast } from "react-toastify";

const { Header, Sider, Content } = Layout;

const AppLayout = ({ children, headerContent }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Updated: ensure we select the correct user info
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out successfully!");
    navigate("/home"); // redirect to home or login page
  };

  console.log("AppLayout user:", user); // debug: check if user exists

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark">
        <Menu theme="dark" mode="inline" selectable={false}>
          <Menu.Item key="dash" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="tablesQR" onClick={() => navigate("/tables")}>
            Tables / QR Codes
          </Menu.Item>
          <Menu.Item key="menu" onClick={() => navigate("/menuitems")}>
            Menu Items
          </Menu.Item>
          <Menu.Item key="vendors" onClick={() => navigate("/vendors")}>
            Vendors
          </Menu.Item>
          <Menu.Item key="items" onClick={() => navigate("/items")}>
            Items
          </Menu.Item>
          <Menu.Item key="staffadmin" onClick={() => navigate("/purchase")}>
            Purchase items
          </Menu.Item>
          <Menu.Item key="stock" onClick={() => navigate("/stocks")}>
            Stock Monitor
          </Menu.Item>
          <Menu.Item key="orders" onClick={() => navigate("/orders")}>
            Orders
          </Menu.Item>
          <Menu.Item key="kitchen" onClick={() => navigate("/kitchen")}>
            Kitchen
          </Menu.Item>
          <Menu.Item key="billing" onClick={() => navigate("/billing")}>
            Billing
          </Menu.Item>
          <Menu.Item key="staffadmin" onClick={() => navigate("/staffAdmin")}>
            Staff
          </Menu.Item>
          <Menu.Item key="Contacts" onClick={() => navigate("/contacts")}>
            contacts
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left side: header title or content */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {headerContent ? (
              headerContent
            ) : (
              <h3 style={{ margin: 0 }}>Restaurant System</h3>
            )}
          </div>

          {/* Right side: Logout button if user exists */}
          <div>
            {user ? (
              <Button type="primary" danger onClick={handleLogout}>
                Logout
              </Button>
            ) : null}
          </div>
        </Header>

        <Content style={{ margin: "16px" }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
