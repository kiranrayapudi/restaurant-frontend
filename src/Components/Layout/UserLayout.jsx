import React from "react";
import { Layout, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/Slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const { Header, Content, Footer } = Layout;

const UserLayout = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          padding: "0 20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          {user ? (
            <Button
              type="primary"
              danger
              onClick={() => {
                dispatch(logout());
                toast.success("Logged out successfully!");
                navigate("/"); // go to landing or login page
              }}
            >
              Logout
            </Button>
          ) : (
            <Button type="primary" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </div>
      </Header>

      <Content style={{ padding: "20px" }}>{children}</Content>

      <Footer style={{ textAlign: "center" }}>
        © {new Date().getFullYear()} Restaurant
      </Footer>
    </Layout>
  );
};

export default UserLayout;
