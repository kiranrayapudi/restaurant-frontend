import React, { useState } from "react";
import { Drawer, Button, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const MobileHeader = ({
  scrollToSection,
  heroRef,
  aboutRef,
  bookingRef,
  contactRef,
  openQRScanner,
  user,
  dispatch,
  logout,
  navigate,
  loginMenu,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: 24 }}>🍽️ Restaurant</div>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
        />
      </div>

      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu mode="vertical" selectable={false}>
          <Menu.Item
            onClick={() => {
              scrollToSection(heroRef);
              setDrawerVisible(false);
            }}
          >
            Home
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              scrollToSection(aboutRef);
              setDrawerVisible(false);
            }}
          >
            Menu
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              scrollToSection(bookingRef);
              setDrawerVisible(false);
            }}
          >
            Booking
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              scrollToSection(contactRef);
              setDrawerVisible(false);
            }}
          >
            Contact
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              openQRScanner();
              setDrawerVisible(false);
            }}
          >
            📷 Scan QR
          </Menu.Item>
          <Menu.Item>
            {user ? (
              <Button
                type="primary"
                danger
                block
                onClick={() => {
                  dispatch(logout());
                  navigate("/");
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                type="primary"
                block
                onClick={() => setDrawerVisible(false)}
              >
                Login
              </Button>
            )}
          </Menu.Item>
        </Menu>
      </Drawer>
    </>
  );
};

export default MobileHeader;
