// src/Pages/Staff/StaffDashboard.jsx
import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  MenuOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  FireOutlined,
  GlobalOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../Redux/Slices/authSlice";
import { toast } from "react-toastify";

import TableBooking from "./TableBooking";
import OrderTaking from "./OrderTaking";
import StockView from "./StockView";
import KitchenStaff from "./KitchenStaff";
import OnlineBooking from "./OnlineBooking";

const { Sider, Content, Header } = Layout;

const StaffDashboard = () => {
  const [selectedKey, setSelectedKey] = useState("1");
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <TableBooking />;
      case "2":
        return <OrderTaking />;
      case "3":
        return <StockView />;
      case "4":
        return <KitchenStaff />;
      case "5":
        return <OnlineBooking />;
      default:
        return <TableBooking />;
    }
  };

  const menuItems = [
    { key: "1", icon: <CalendarOutlined />, label: "Table Booking" },
    { key: "2", icon: <ShoppingCartOutlined />, label: "Taking Orders" },
    { key: "3", icon: <DatabaseOutlined />, label: "Stock View" },
    { key: "4", icon: <FireOutlined />, label: "Kitchen Staff" },
    { key: "5", icon: <GlobalOutlined />, label: "Online Booking" },
  ];

  const menuContent = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      onClick={(e) => {
        setSelectedKey(e.key);
        if (isMobile) setDrawerVisible(false); // close drawer on mobile
      }}
      items={menuItems}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          theme="light"
          width={220}
          style={{
            borderRight: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                padding: "16px",
                fontWeight: "bold",
                textAlign: "center",
                borderBottom: "1px solid #eee",
              }}
            >
              Staff Panel
            </div>
            {menuContent}
          </div>

          <div style={{ padding: "16px", borderTop: "1px solid #eee" }}>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              block
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Sider>
      )}

      <Layout>
        {/* Mobile Header */}
        {isMobile && (
          <Header
            style={{
              background: "#fff",
              padding: "0 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #eee",
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />
            <div style={{ fontWeight: "bold" }}>Staff Panel</div>
            <Button
              type="primary"
              danger
              size="small"
              onClick={handleLogout}
              icon={<LogoutOutlined />}
            />
          </Header>
        )}

        {/* Drawer for mobile menu */}
        <Drawer
          title="Staff Panel"
          placement="left"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          {menuContent}
        </Drawer>

        <Content
          style={{
            padding: "16px",
            background: "#fff",
            minHeight: "100vh",
            overflowY: "auto",
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffDashboard;
