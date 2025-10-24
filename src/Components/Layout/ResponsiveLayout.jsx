// src/Components/Layout/ResponsiveLayout.jsx
import React, { useState } from "react";
import { Layout, Menu, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/Slices/authSlice";
import { toast } from "react-toastify";

const { Header, Content, Footer } = Layout;

const ResponsiveLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    { key: "home", label: "Home", onClick: () => scrollToSection("hero") },
    { key: "menu", label: "Menu", onClick: () => scrollToSection("menu") },
    {
      key: "booking",
      label: "Booking",
      onClick: () => scrollToSection("booking"),
    },
    {
      key: "contact",
      label: "Contact",
      onClick: () => scrollToSection("contact"),
    },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setDrawerVisible(false);
  };

  return (
    <Layout>
      {/* HEADER */}
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: 20 }}>🍽️ Restaurant</div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: "flex", gap: "10px" }}>
          {menuItems.map((item) => (
            <Button key={item.key} type="link" onClick={item.onClick}>
              {item.label}
            </Button>
          ))}
          {user ? (
            <Button
              type="primary"
              danger
              onClick={() => {
                dispatch(logout());
                toast.success("Logged out successfully!");
                navigate("/");
              }}
            >
              Logout
            </Button>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <Button
          className="mobile-menu-button"
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          style={{ display: "none" }}
        />

        {/* Mobile Drawer */}
        <Drawer
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          <Menu mode="vertical" items={menuItems} />
          {user && (
            <Button
              type="primary"
              danger
              block
              style={{ marginTop: 10 }}
              onClick={() => {
                dispatch(logout());
                toast.success("Logged out successfully!");
                navigate("/");
                setDrawerVisible(false);
              }}
            >
              Logout
            </Button>
          )}
        </Drawer>
      </Header>

      {/* MAIN CONTENT */}
      <Content
        style={{
          minHeight: "calc(100vh - 64px - 64px)",
          padding: "20px",
        }}
      >
        {children}
      </Content>

      {/* FOOTER */}
      <Footer style={{ textAlign: "center" }}>
        © {new Date().getFullYear()} Restaurant. All rights reserved.
      </Footer>

      {/* GLOBAL CSS FOR MOBILE */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-button { display: block !important; }
          .ant-card { margin-bottom: 20px !important; }
        }
      `}</style>
    </Layout>
  );
};

export default ResponsiveLayout;
