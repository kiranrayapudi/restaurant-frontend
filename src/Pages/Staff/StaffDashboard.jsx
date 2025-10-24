// src/Pages/Staff/StaffDashboard.jsx
import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
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
import OnlineBooking from "./OnlineBooking"; // ✅ import new component

const { Sider, Content } = Layout;

const StaffDashboard = () => {
  const [selectedKey, setSelectedKey] = useState("1");
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        return <OnlineBooking />; // ✅ use separate component
      default:
        return <TableBooking />;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
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

          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            onClick={(e) => setSelectedKey(e.key)}
            items={[
              { key: "1", icon: <CalendarOutlined />, label: "Table Booking" },
              {
                key: "2",
                icon: <ShoppingCartOutlined />,
                label: "Taking Orders",
              },
              { key: "3", icon: <DatabaseOutlined />, label: "Stock View" },
              { key: "4", icon: <FireOutlined />, label: "Kitchen Staff" },
              { key: "5", icon: <GlobalOutlined />, label: "Online Booking" }, // ✅
            ]}
          />
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

      <Layout>
        <Content
          style={{
            padding: "24px",
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
