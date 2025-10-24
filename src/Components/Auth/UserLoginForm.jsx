import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../Redux/Slices/authSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserLoginForm = () => {
  const [step, setStep] = useState(1); // 1: name+mobile, 2: OTP
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!name || !mobile) {
      toast.error("Enter your name and mobile!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "https://restaurant-backend-kiran.up.railway.app/api/auth/send-otp",
        {
          name,
          mobile,
        }
      );
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://restaurant-backend-kiran.up.railway.app/api/auth/verify-otp",
        {
          name,
          mobile,
          otp: values.otp,
        }
      );

      const { user, token } = res.data;

      // Dispatch login with both user and token
      dispatch(loginSuccess({ user, token }));

      toast.success("Logged in successfully!");
      navigate("/usermenu"); // navigate to menu page
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      {step === 1 && (
        <Form layout="vertical">
          <Form.Item label="Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Item>
          <Form.Item label="Mobile" required>
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
            />
          </Form.Item>
          <Button
            type="primary"
            block
            onClick={handleSendOtp}
            loading={loading}
          >
            Send OTP
          </Button>
        </Form>
      )}

      {step === 2 && (
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Name">
            <Input value={name} disabled />
          </Form.Item>
          <Form.Item label="Mobile">
            <Input value={mobile} disabled />
          </Form.Item>
          <Form.Item name="otp" label="OTP" rules={[{ required: true }]}>
            <Input placeholder="Enter OTP" />
          </Form.Item>
          <Button
            type="default"
            block
            style={{ marginBottom: 10 }}
            onClick={() => setStep(1)}
            disabled={loading}
          >
            Back
          </Button>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form>
      )}
    </div>
  );
};

export default UserLoginForm;
