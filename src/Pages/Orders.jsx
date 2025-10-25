import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Spin, Modal, Table } from "antd";
import { FaShoppingCart, FaCheckCircle, FaClock } from "react-icons/fa";
import AppLayout from "../Components/Layout/AppLayout";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSelector, useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { fetchOrders } from "../Redux/Slices/orderSlice";
import { fetchStaff } from "../Redux/Slices/staffSlice";

const DashboardStats = () => {
  const dispatch = useDispatch();

  const ordersData = useSelector((state) => state.orders.orders || []);
  const ordersLoading = useSelector((state) => state.orders.loading);
  const staffList = useSelector((state) => state.staff.list || []);
  const staffLoading = useSelector((state) => state.staff.loading);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    dispatch(fetchOrders()).catch(() => toast.error("Failed to fetch orders"));
    dispatch(fetchStaff()).catch(() => toast.error("Failed to fetch staff"));
    console.log("Orders Data:", JSON.stringify(ordersData, null, 2));
    console.log("Staff List:", JSON.stringify(staffList, null, 2));
  }, [dispatch]);

  const loading = ordersLoading || staffLoading;

  const enrichedOrders = useMemo(() => {
    if (!ordersData.length) {
      console.log("No orders data available");
      return [];
    }
    if (!staffList.length) {
      console.log("No staff data available");
    }
    return ordersData.map((order) => {
      if (!order.staff_id) {
        console.warn(`Order ID ${order.id} has no staff_id`);
      }
      if (!order.total_amount && order.total_amount !== 0) {
        console.warn(`Order ID ${order.id} has no total_amount`);
      }
      const staff =
        staffList.find((s) => {
          const match = String(s.id) === String(order.staff_id);
          if (!match && order.staff_id) {
            console.warn(
              `No staff found for staff_id: ${order.staff_id} in order ID: ${order.id}, available staff IDs:`,
              staffList.map((s) => s.id)
            );
          }
          return match;
        }) || {};
      return {
        ...order,
        staff_name: staff.name || "No Staff Assigned",
        staff_role: staff.role || "-",
        staff_contact: staff.contact || "-",
        total_amount:
          order.total_amount ?? order.totalAmount ?? "Not Available",
      };
    });
  }, [ordersData, staffList]);

  const totalOrders = enrichedOrders.length;
  const completedOrders = enrichedOrders.filter(
    (o) => o.status === "Completed"
  ).length;
  const pendingOrders = enrichedOrders.filter(
    (o) => o.status === "Pending" || o.status === "Started Preparing"
  ).length;

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <FaShoppingCart size={30} color="#fff" />,
      bgColor: "linear-gradient(135deg, #667eea, #764ba2)",
      filter: () => enrichedOrders,
    },

    {
      title: "Completed Orders",
      value: completedOrders,
      icon: <FaCheckCircle size={30} color="#fff" />,
      bgColor: "linear-gradient(135deg, #43e97b, #38f9d7)",
      filter: () => enrichedOrders.filter((o) => o.status === "Completed"),
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: <FaClock size={30} color="#fff" />,
      bgColor: "linear-gradient(135deg, #f7971e, #ffd200)",
      filter: () =>
        enrichedOrders.filter(
          (o) => o.status === "Pending" || o.status === "Started Preparing"
        ),
    },
  ];

  const columns = [
    { title: "Order ID", dataIndex: "id", key: "id" },
    { title: "Table No", dataIndex: "table_number", key: "table_number" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Total (₹)",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (value) => (value === "Not Available" ? value : `₹${value}`),
    },
    {
      title: "Staff Name",
      dataIndex: "staff_name",
      key: "staff_name",
      render: (value) => value || "No Staff Assigned",
    },
    {
      title: "Role",
      dataIndex: "staff_role",
      key: "staff_role",
      render: (value) => value || "-",
    },
    {
      title: "Contact",
      dataIndex: "staff_contact",
      key: "staff_contact",
      render: (value) => value || "-",
    },
  ];

  const handleCardClick = (stat) => {
    setModalTitle(stat.title);
    setModalData(stat.filter());
    setModalVisible(true);
  };

  const pieData = [
    { name: "Completed Orders", value: completedOrders },
    { name: "Pending Orders", value: pendingOrders },
  ];
  const COLORS = ["#43e97b", "#fdb417"];

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ marginTop: 100, display: "block", textAlign: "center" }}
      />
    );
  }

  if (!enrichedOrders.length && !ordersLoading) {
    return (
      <AppLayout>
        <p style={{ textAlign: "center", marginTop: 100 }}>
          No order data available. Please check the API or try again later.
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ToastContainer position="top-right" autoClose={2000} />
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card
              bordered={false}
              hoverable
              onClick={() => handleCardClick(stat)}
              style={{
                textAlign: "center",
                color: "#fff",
                background: stat.bgColor,
                borderRadius: 10,
                boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            >
              <div style={{ marginBottom: 10 }}>{stat.icon}</div>
              <h2 style={{ fontSize: 28, fontWeight: "bold" }}>{stat.value}</h2>
              <p style={{ fontSize: 14 }}>{stat.title}</p>
            </Card>
          </Col>
        ))}
      </Row>

      <Row justify="start" style={{ marginTop: 60 }}>
        <Col xs={24} md={12}>
          <Card
            title="Overview Summary"
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              height: 400,
            }}
          >
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    // Only show value as label
                    label={({ value }) => value}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title={modalTitle}
        width={800}
      >
        {modalData.length > 0 ? (
          <Table
            columns={columns}
            dataSource={modalData}
            pagination={{ pageSize: 5 }}
            rowKey="id"
            scroll={{ x: "max-content", y: 400 }}
          />
        ) : (
          <p style={{ textAlign: "center", marginTop: 20 }}>
            No {modalTitle.toLowerCase()} available.
          </p>
        )}
      </Modal>
    </AppLayout>
  );
};

export default DashboardStats;
