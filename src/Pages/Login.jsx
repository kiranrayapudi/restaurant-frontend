import React from "react";
import { Card, Typography, Button, Divider } from "antd";
import { GoogleOutlined, FacebookOutlined } from "@ant-design/icons";
import LoginForm from "../Components/Auth/LoginForm";

const { Title, Text, Link } = Typography;

const Login = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #4facfe, #00f2fe)",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <Title level={2} style={{ color: "#fff" }}>
          Welcome Back
        </Title>
        <Text style={{ color: "#fff", fontSize: 16 }}>
          Sign in to access your dashboard
        </Text>
      </div>

      {/* Login Card */}
      <Card
        style={{
          width: 700,
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        <LoginForm />

        {/* Forgot Password */}
        <div style={{ textAlign: "right", marginTop: 10 }}>
          <Link href="/forgot-password">Forgot Password?</Link>
        </div>

        {/* Divider */}
        <Divider>Or sign in with</Divider>

        {/* Social Login Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            type="default"
            icon={<GoogleOutlined />}
            style={{ flex: 1, marginRight: 10 }}
          >
            Google
          </Button>
          <Button
            type="default"
            icon={<FacebookOutlined />}
            style={{ flex: 1 }}
          >
            Facebook
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Text style={{ color: "#fff", fontSize: 14 }}>
          © {new Date().getFullYear()} YourCompany. All rights reserved.
        </Text>
      </div>
    </div>
  );
};

export default Login;
