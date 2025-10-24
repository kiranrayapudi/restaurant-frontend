// src/Components/Footer.jsx
import React from "react";
import { Row, Col } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#1a1a1a",
        color: "#fff",
        padding: "60px 40px",
      }}
    >
      <Row gutter={[32, 32]}>
        {/* Brand & Description */}
        <Col xs={24} md={8}>
          <h2
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 700,
              fontSize: "1.8rem",
              color: "#fff",
              marginBottom: 20,
            }}
          >
            🍽️ Restaurant
          </h2>
          <p style={{ color: "#ccc", lineHeight: 1.6 }}>
            Experience fine dining like never before. Our chefs craft exquisite
            dishes with fresh ingredients, creating unforgettable culinary
            memories.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: "15px" }}>
            <a href="#" style={{ color: "#fff", fontSize: "1.2rem" }}>
              <FacebookOutlined />
            </a>
            <a href="#" style={{ color: "#fff", fontSize: "1.2rem" }}>
              <InstagramOutlined />
            </a>
            <a href="#" style={{ color: "#fff", fontSize: "1.2rem" }}>
              <TwitterOutlined />
            </a>
            <a href="#" style={{ color: "#fff", fontSize: "1.2rem" }}>
              <YoutubeOutlined />
            </a>
          </div>
        </Col>

        {/* Quick Links */}
        <Col xs={24} md={8}>
          <h3 style={{ fontWeight: 600, fontSize: "1.3rem", marginBottom: 20 }}>
            Quick Links
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              color: "#ccc",
              lineHeight: 2,
            }}
          >
            <li>
              <a href="#hero" style={{ color: "#ccc" }}>
                Home
              </a>
            </li>
            <li>
              <a href="#dining" style={{ color: "#ccc" }}>
                Dining
              </a>
            </li>
            <li>
              <a href="#about" style={{ color: "#ccc" }}>
                About Us
              </a>
            </li>
            <li>
              <a href="#booking" style={{ color: "#ccc" }}>
                Booking
              </a>
            </li>
            <li>
              <a href="#contact" style={{ color: "#ccc" }}>
                Contact
              </a>
            </li>
          </ul>
        </Col>

        {/* Contact Info */}
        <Col xs={24} md={8}>
          <h3 style={{ fontWeight: 600, fontSize: "1.3rem", marginBottom: 20 }}>
            Contact Info
          </h3>
          <p style={{ color: "#ccc", lineHeight: 2 }}>
            <EnvironmentOutlined /> 123 RestaurantStreet, Food City
          </p>
          <p style={{ color: "#ccc", lineHeight: 2 }}>
            <PhoneOutlined /> +91 9876543210
          </p>
          <p style={{ color: "#ccc", lineHeight: 2 }}>
            <MailOutlined /> info@Restaurant.com
          </p>
        </Col>
      </Row>

      <hr style={{ borderColor: "#444", margin: "40px 0" }} />

      <Row justify="space-between" align="middle">
        <Col>
          <p style={{ color: "#777", margin: 0 }}>
            © 2025 Restaurant. All Rights Reserved.
          </p>
        </Col>
        <Col>
          <p style={{ color: "#777", margin: 0 }}>
            Designed with ❤️ by kiran_rayapudi
          </p>
        </Col>
      </Row>
    </footer>
  );
};

export default Footer;
