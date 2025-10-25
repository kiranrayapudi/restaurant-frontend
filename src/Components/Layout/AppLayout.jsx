import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/Slices/authSlice";
import { toast } from "react-toastify";

const { Header, Sider, Content } = Layout;

const AppLayout = ({ children, headerContent }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out successfully!");
    navigate("/home");
  };

  const menuItems = [
    { key: "dash", label: "Dashboard", onClick: () => navigate("/dashboard") },
    {
      key: "tablesQR",
      label: "Tables / QR Codes",
      onClick: () => navigate("/tables"),
    },
    { key: "menu", label: "Menu Items", onClick: () => navigate("/menuitems") },
    { key: "vendors", label: "Vendors", onClick: () => navigate("/vendors") },
    { key: "items", label: "Items", onClick: () => navigate("/items") },
    {
      key: "purchase",
      label: "Purchase Items",
      onClick: () => navigate("/purchase"),
    },
    {
      key: "stock",
      label: "Stock Monitor",
      onClick: () => navigate("/stocks"),
    },
    { key: "orders", label: "Orders", onClick: () => navigate("/orders") },
    { key: "kitchen", label: "Kitchen", onClick: () => navigate("/kitchen") },
    { key: "billing", label: "Billing", onClick: () => navigate("/billing") },
    { key: "staff", label: "Staff", onClick: () => navigate("/staffAdmin") },
    {
      key: "contacts",
      label: "Contacts",
      onClick: () => navigate("/contacts"),
    },
  ];

  const menuContent = (
    <Menu
      theme={isMobile ? "light" : "dark"}
      mode="inline"
      selectable={false}
      items={menuItems.map((item) => ({
        key: item.key,
        label: item.label,
        onClick: () => {
          item.onClick();
          if (isMobile) setDrawerVisible(false);
        },
      }))}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && <Sider theme="dark">{menuContent}</Sider>}

      <Layout>
        {/* Header */}
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
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />
          )}
          <div style={{ fontWeight: "bold" }}>
            {headerContent || "Restaurant System"}
          </div>
          <Button
            type="primary"
            danger
            size="small"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            {!isMobile && "Logout"}
          </Button>
        </Header>

        {/* Drawer for Mobile Menu */}
        {isMobile && (
          <Drawer
            title="Menu"
            placement="left"
            closable
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={{ padding: 0 }}
          >
            {menuContent}
            <div style={{ padding: "16px", borderTop: "1px solid #eee" }}>
              <Button
                type="primary"
                danger
                block
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </Drawer>
        )}

        <Content style={{ margin: "16px" }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
