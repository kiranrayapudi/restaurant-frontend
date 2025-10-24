import React, { useEffect, useState } from "react";
import { Row, Col, Card, Tabs, Spin, Modal } from "antd";
import UserLayout from "../Components/Layout/UserLayout";
import axios from "axios";

const { TabPane } = Tabs;

const UserMenu = () => {
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // For modal
  const [isModalVisible, setIsModalVisible] = useState(false);

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
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <UserLayout>
      <div
        style={{ minHeight: "100vh", padding: "30px", backgroundColor: "#fff" }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 30 }}>🍴 Our Menu</h1>

        <Tabs centered defaultActiveKey="1">
          {Object.entries(menu).map(([category, items], index) => (
            <TabPane tab={category} key={index + 1}>
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
                              alt={item.name}
                              src={
                                item.image || "https://via.placeholder.com/200"
                              }
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

        {/* Modal for showing item details */}
        {selectedItem && (
          <Modal
            visible={isModalVisible}
            title={selectedItem.name}
            onCancel={handleModalClose}
            footer={null}
          >
            <img
              src={selectedItem.image || "https://via.placeholder.com/400"}
              alt={selectedItem.name}
              style={{ width: "100%", marginBottom: 20 }}
            />
            <p>
              <strong>Price:</strong> ₹{selectedItem.price}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {selectedItem.description || "No description available"}
            </p>
          </Modal>
        )}
      </div>
    </UserLayout>
  );
};

export default UserMenu;
