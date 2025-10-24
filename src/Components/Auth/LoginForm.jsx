import React, { useState } from "react";
import { Form, Input, Button, Card, Select } from "antd";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../Redux/Slices/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const LoginForm = ({ onLoginSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const { email, password, role } = values;

    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate API

    // Demo hardcoded credentials (you can replace with API check later)
    if (email === "kiran@gmail.com" && password === "kiran9966") {
      const fakeUser = { id: 1, name: "Kiran", email, role };
      const fakeToken = "fake-jwt-token";

      dispatch(loginSuccess({ user: fakeUser, token: fakeToken }));
      toast.success(`Welcome ${role}!`);

      if (onLoginSuccess) onLoginSuccess();

      // ✅ Role-based navigation
      if (role === "admin") navigate("/dashboard");
      else if (role === "staff") navigate("/staff-dashboard");
      else if (role === "Kitchen") navigate("/kitchen-dashboard");
      else navigate("/dashboard"); // default fallback
    } else {
      toast.error("Invalid credentials!");
    }

    setLoading(false);
  };

  return (
    <Card
      title="Login"
      style={{
        maxWidth: 400,
        margin: "20px auto",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        {/* Role Selection */}
        <Form.Item
          name="role"
          label="Select Role"
          rules={[{ required: true, message: "Please select your role!" }]}
        >
          <Select placeholder="Choose your role">
            <Option value="admin">Admin</Option>
            <Option value="staff">Staff</Option>
            <Option value="Kitchen">Kitchen</Option>
            {/* <Option value="manager">Manager</Option> */}
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Login
        </Button>
      </Form>
    </Card>
  );
};

export default LoginForm;
