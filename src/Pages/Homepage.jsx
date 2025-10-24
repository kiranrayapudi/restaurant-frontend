import React, { useRef, useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Carousel,
  Dropdown,
  Button,
  Card,
  Row,
  Col,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Spin,
  Tabs,
  message,
  Drawer,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/Slices/authSlice";
import { toast } from "react-toastify";
import LoginForm from "../Components/Auth/LoginForm";
import UserLoginForm from "../Components/Auth/UserLoginForm";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import axios from "axios";

// Images
import hero1 from "../assets/extra4.jpg";
import hero2 from "../assets/fine_dinning_image.jpeg";
import hero3 from "../assets/pexels-rachel-claire-4577179.jpg";
import aboutImg from "../assets/about_us.jpeg";
import bookingImg from "../assets/booking.jpg";
import contactImg from "../assets/contact_us.webp";

const { Header, Content } = Layout;
const { TabPane } = Tabs;

const HomePage = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginType, setLoginType] = useState(null); // "user" or "staff"

  const [bookingForm] = Form.useForm();
  const [contactForm] = Form.useForm();

  const scanningRef = useRef(true);

  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const bookingRef = useRef(null);
  const contactRef = useRef(null);
  const aboutUsRef = useRef(null);

  const scrollToSection = (ref) =>
    ref.current.scrollIntoView({ behavior: "smooth" });

  // Menu State
  const [menu, setMenu] = useState({});
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    // Wait one render cycle to ensure Redux user is fetched
    const timer = setTimeout(() => setUserLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Pre-fill booking form if user exists
  useEffect(() => {
    if (user) {
      bookingForm.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  // Fetch Menu
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(
          "https://restaurant-backend-kiran.up.railway.app/api/menu"
        );
        const menuArray = Array.isArray(res.data.menu) ? res.data.menu : [];
        const groupedMenu = menuArray.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});
        setMenu(groupedMenu);
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setIsMenuModalVisible(true);
  };

  const handleModalClose = () => {
    setIsMenuModalVisible(false);
    setSelectedItem(null);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setIsLoginOpen(false);

    if (loginType === "user" && scannedData) {
      navigate(`/usermenu?table=${scannedData}`);
      setScannedData(null);
      return;
    }

    if (loggedInUser?.role === "Admin") navigate("/dashboard");
    else if (loggedInUser?.role === "staff") navigate("/staff-dashboard");
    else if (loggedInUser?.role === "Kitchen") navigate("/kitchen-dashboard");
    else navigate("/usermenu");
  };

  const handleBooking = async (values) => {
    if (!user) {
      message.warning("Please login before booking a table!");
      setLoginType("user");
      setIsLoginOpen(true);
      return;
    }

    try {
      const payload = {
        name: values.name,
        email: values.email,
        mobile: values.phone,
        date: values.date.format("YYYY-MM-DD"),
        time: values.time.format("HH:mm:ss"),
        guests: values.guests,
      };

      const res = await axios.post(
        "https://restaurant-backend-kiran.up.railway.app/api/online-bookings/book",
        payload
      );

      if (res.status === 201) {
        message.success("Table booked successfully!");
        bookingForm.resetFields();
      } else {
        message.error("Something went wrong. Please try again!");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      message.error("Failed to book table. Try again later.");
    }
  };

  const handleContact = async (values) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        message: values.message,
      };

      const res = await axios.post(
        "https://restaurant-backend-kiran.up.railway.app/api/contacts",
        payload
      );

      if (res.status === 201 || res.status === 200) {
        toast.success("Message sent successfully!");
        contactForm.resetFields();
      } else {
        toast.error("Failed to send message. Please try again!");
      }
    } catch (error) {
      console.error("Contact Form Error:", error);
      toast.error("Failed to send message. Try again later!");
    }
  };

  const loginMenu = {
    items: [
      {
        key: "user",
        label: "User Login (Mobile OTP)",
        onClick: () => {
          setLoginType("user");
          setIsLoginOpen(true);
        },
      },
      {
        key: "staff",
        label: "Staff / Admin / Kitchen Login",
        onClick: () => {
          setLoginType("staff");
          setIsLoginOpen(true);
        },
      },
    ],
  };

  const openQRScanner = () => {
    setIsQRScannerOpen(true);
    scanningRef.current = true;
    setScannedData(null);
  };

  const heroSlides = [
    {
      img: hero1,
      title: "Fine Dining Experience",
      subtitle: "Delicious meals in a cozy ambiance",
    },
    {
      img: hero2,
      title: "Fresh & Delicious",
      subtitle: "Taste the best quality ingredients",
    },
    {
      img: hero3,
      title: "Cozy Ambiance",
      subtitle: "Relax and enjoy your favorite dishes",
    },
  ];

  return (
    <Layout>
      {/* HEADER */}
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <div style={{ fontWeight: "bold", fontSize: 24 }}>🍽️ Restaurant</div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: "flex", gap: 8 }}>
          <Menu
            mode="horizontal"
            style={{ borderBottom: "none" }}
            selectable={false}
          >
            <Menu.Item key="home">
              <Button type="link" onClick={() => scrollToSection(heroRef)}>
                Home
              </Button>
            </Menu.Item>
            <Menu.Item key="menu">
              <Button type="link" onClick={() => scrollToSection(aboutRef)}>
                Menu
              </Button>
            </Menu.Item>
            <Menu.Item key="booking">
              <Button type="link" onClick={() => scrollToSection(bookingRef)}>
                Booking
              </Button>
            </Menu.Item>
            <Menu.Item key="contact">
              <Button type="link" onClick={() => scrollToSection(contactRef)}>
                Contact
              </Button>
            </Menu.Item>
            <Menu.Item key="aboutus">
              <Button type="link" onClick={() => scrollToSection(aboutUsRef)}>
                About Us
              </Button>
            </Menu.Item>
            <Menu.Item key="scanqr">
              <Button
                type="link"
                onClick={openQRScanner}
                style={{ fontWeight: "bold" }}
              >
                📷 Scan QR
              </Button>
            </Menu.Item>

            {/* Auth Button */}
            <Menu.Item key="auth">
              {user === undefined ? (
                <Button type="primary" loading block>
                  Loading
                </Button>
              ) : user && Object.keys(user).length > 0 ? (
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
                <Dropdown menu={loginMenu}>
                  <Button type="primary" block>
                    Login
                  </Button>
                </Dropdown>
              )}
            </Menu.Item>
          </Menu>
        </div>

        {/* Mobile Menu Button */}
        <div
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(true)}
          style={{ display: "none", fontSize: 24, cursor: "pointer" }}
        >
          ☰
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setIsMobileMenuOpen(false)}
          open={isMobileMenuOpen}
        >
          <Menu mode="vertical" selectable={false}>
            {["home", "menu", "booking", "contact", "aboutus", "scanqr"].map(
              (key) => (
                <Menu.Item
                  key={key}
                  onClick={() => {
                    const refMap = {
                      home: heroRef,
                      menu: aboutRef,
                      booking: bookingRef,
                      contact: contactRef,
                      aboutus: aboutUsRef,
                    };
                    if (key === "scanqr") openQRScanner();
                    else scrollToSection(refMap[key]);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {key === "scanqr"
                    ? "📷 Scan QR"
                    : key.charAt(0).toUpperCase() + key.slice(1)}
                </Menu.Item>
              )
            )}

            {/* Auth Button */}
            <Menu.Item key="auth">
              {user && Object.keys(user).length > 0 ? (
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
                <Dropdown menu={loginMenu}>
                  <Button type="primary" block>
                    Login
                  </Button>
                </Dropdown>
              )}
            </Menu.Item>
          </Menu>
        </Drawer>
      </Header>

      {/* CONTENT */}
      <Content style={{ scrollBehavior: "smooth" }}>
        {/* Hero Carousel */}
        <section ref={heroRef} style={{ position: "relative" }}>
          <Carousel autoplay effect="fade">
            {heroSlides.map((slide, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <img
                  src={slide.img}
                  alt={slide.title}
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#fff",
                    textAlign: "center",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    padding: "20px 40px",
                    borderRadius: 10,
                  }}
                >
                  <h1 style={{ fontSize: "2rem", marginBottom: 10 }}>
                    {slide.title}
                  </h1>
                  <p style={{ fontSize: "1.2rem" }}>{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </Carousel>
        </section>

        {/* Menu Section */}
        <section
          ref={aboutRef}
          style={{ padding: "50px 20px", backgroundColor: "#fafafa" }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 40 }}>🍴 Our Menu</h2>
          {loadingMenu ? (
            <Spin
              size="large"
              style={{ display: "block", margin: "50px auto" }}
            />
          ) : (
            <Tabs centered defaultActiveKey={Object.keys(menu)[0]}>
              {Object.entries(menu).map(([category, items]) => (
                <TabPane tab={category} key={category}>
                  <Row gutter={[24, 24]} justify="center">
                    {Array.isArray(items) && items.length > 0 ? (
                      items.map((item) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                          <Card
                            hoverable
                            cover={
                              <div
                                style={{
                                  height: 200,
                                  overflow: "hidden",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleCardClick(item)}
                              >
                                <img
                                  src={
                                    item.image ||
                                    "https://via.placeholder.com/200"
                                  }
                                  alt={item.name}
                                  style={{
                                    height: "100%",
                                    width: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            }
                          >
                            <h3>{item.name}</h3>
                            <p>₹{item.price}</p>
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <p>No items found in this category</p>
                    )}
                  </Row>
                </TabPane>
              ))}
            </Tabs>
          )}
        </section>

        {/* About Us */}
        <section
          ref={aboutUsRef}
          style={{ padding: "50px 20px", backgroundColor: "#fff" }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 40 }}>About Us</h2>
          <Row justify="center" gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <img
                src={aboutImg}
                alt="About Us"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  height: 300,
                  objectFit: "cover",
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <p style={{ fontSize: 16, lineHeight: 1.6 }}>
                Welcome to our restaurant! We serve the finest dishes with fresh
                ingredients and a cozy ambiance. Our mission is to create a
                delightful dining experience for everyone.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.6 }}>
                Join us to enjoy exquisite flavors, friendly service, and a
                welcoming atmosphere.
              </p>
            </Col>
          </Row>
        </section>

        {/* Booking Section */}
        <section ref={bookingRef} style={{ padding: "50px 20px" }}>
          <h2 style={{ textAlign: "center", marginBottom: 40 }}>
            Book a Table
          </h2>
          <Row justify="center" gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <img
                src={bookingImg}
                alt="Booking"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  height: 300,
                  objectFit: "cover",
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Card title="Booking Form" bordered={false}>
                <Form
                  form={bookingForm}
                  layout="vertical"
                  onFinish={handleBooking}
                >
                  <Form.Item
                    name="name"
                    label="Your Name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}
                  >
                    <Input placeholder="Name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Please enter a valid email" },
                    ]}
                  >
                    <Input placeholder="Email" />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your phone number",
                      },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    ]}
                  >
                    <Input placeholder="Phone Number" />
                  </Form.Item>
                  <Form.Item
                    name="date"
                    label="Date"
                    rules={[
                      { required: true, message: "Please select a date" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="time"
                    label="Time"
                    rules={[
                      { required: true, message: "Please select a time" },
                    ]}
                  >
                    <TimePicker style={{ width: "100%" }} format="HH:mm" />
                  </Form.Item>
                  <Form.Item
                    name="guests"
                    label="Guests"
                    rules={[
                      {
                        required: true,
                        message: "Please enter number of guests",
                      },
                    ]}
                  >
                    <Input type="number" placeholder="Number of guests" />
                  </Form.Item>
                  <Button type="primary" block htmlType="submit">
                    Book Now
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Contact Section */}
        <section
          ref={contactRef}
          style={{ padding: "50px 20px", backgroundColor: "#fafafa" }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 40 }}>Contact Us</h2>
          <Row justify="center" gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <Card title="Contact Form" bordered={false}>
                <Form
                  form={contactForm}
                  layout="vertical"
                  onFinish={handleContact}
                >
                  <Form.Item
                    name="name"
                    label="Your Name"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true }, { type: "email" }]}
                  >
                    <Input placeholder="Email" />
                  </Form.Item>
                  <Form.Item
                    name="message"
                    label="Message"
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea placeholder="Your message" rows={4} />
                  </Form.Item>
                  <Button type="primary" block htmlType="submit">
                    Send Message
                  </Button>
                </Form>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <img
                src={contactImg}
                alt="Contact"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  height: 300,
                  objectFit: "cover",
                }}
              />
            </Col>
          </Row>
        </section>
      </Content>

      {/* FOOTER */}
      <Footer />

      {/* LOGIN MODAL */}
      <Modal
        open={isLoginOpen}
        onCancel={() => setIsLoginOpen(false)}
        footer={null}
        centered
      >
        {loginType === "user" && (
          <UserLoginForm onLoginSuccess={handleLoginSuccess} />
        )}
        {loginType === "staff" && (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        )}
      </Modal>

      {/* QR SCANNER MODAL */}
      <Modal
        open={isQRScannerOpen}
        onCancel={() => setIsQRScannerOpen(false)}
        footer={null}
        centered
        width={400}
      >
        <h3 style={{ textAlign: "center", marginBottom: 20 }}>Scan Table QR</h3>
        <QrReader
          onResult={(result, error) => {
            if (!scanningRef.current) return;

            if (result) {
              scanningRef.current = false;
              setIsQRScannerOpen(false);
              const scannedText = result?.text;
              let tableNo = null;

              try {
                const parsed = JSON.parse(scannedText);
                if (parsed?.table) tableNo = parsed.table;
              } catch {
                try {
                  const url = new URL(scannedText);
                  const pathParts = url.pathname.split("/").filter(Boolean);
                  tableNo = pathParts[1] || pathParts[0] || null;
                } catch {
                  tableNo = null;
                }
              }

              if (tableNo) {
                setScannedData(tableNo);
                toast.success(`Table ${tableNo} scanned successfully!`, {
                  autoClose: 2000,
                });
                if (!user) {
                  setLoginType("user");
                  setIsLoginOpen(true);
                } else {
                  navigate(`/usermenu?table=${tableNo}`);
                }
              } else {
                toast.error("Invalid QR code. Table not found!", {
                  autoClose: 3000,
                });
              }
            }

            if (error) {
              const seriousErrors = [
                "NotAllowedError",
                "NotFoundError",
                "NotReadableError",
              ];
              if (seriousErrors.includes(error.name)) {
                toast.error(
                  "Cannot access camera. Please allow camera or use supported device.",
                  { autoClose: 3000 }
                );
                setIsQRScannerOpen(false);
              }
            }
          }}
          constraints={{ facingMode: "environment" }}
          style={{ width: "100%" }}
        />
      </Modal>

      {/* MENU ITEM MODAL */}
      <Modal
        open={isMenuModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        {selectedItem && (
          <>
            <img
              src={selectedItem.image || "https://via.placeholder.com/300"}
              alt={selectedItem.name}
              style={{ width: "100%", marginBottom: 20, borderRadius: 10 }}
            />
            <h3>{selectedItem.name}</h3>
            <p>Price: ₹{selectedItem.price}</p>
            <p>{selectedItem.description}</p>
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default HomePage;
