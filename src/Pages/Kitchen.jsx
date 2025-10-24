import React, { useEffect, useState } from "react";
import { Table, Card, Row, Col, Statistic, Spin, Tag } from "antd";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useDispatch, useSelector } from "react-redux";
import AppLayout from "../Components/Layout/AppLayout";
import { fetchOrders } from "../Redux/Slices/orderSlice";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const KitchenDashboardAdmin = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders || []);
  const [loading, setLoading] = useState(true);
  const [elapsedTimes, setElapsedTimes] = useState({});
  // Define which statuses are considered for each category
  const pendingStatuses = ["Started Preparing"];
  const preparingStatuses = ["Cooking", "Ready"];
  const completedStatuses = ["Completed"];

  // Calculate counts
  const pendingCount = orders.filter((o) =>
    pendingStatuses.includes(o.status)
  ).length;

  const preparingCount = orders.filter((o) =>
    preparingStatuses.includes(o.status)
  ).length;

  const completedCount = orders.filter((o) =>
    completedStatuses.includes(o.status)
  ).length;

  const totalOrders = orders.length;

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      await dispatch(fetchOrders());
      setLoading(false);
    };

    loadOrders();
    const interval = setInterval(loadOrders, 50000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, [dispatch]);

  // Live elapsed timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsed = {};
      orders.forEach((order) => {
        if (order.status === "Cooking" && order.startedAt) {
          const diffMs = new Date() - new Date(order.startedAt);
          const minutes = Math.floor(diffMs / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);
          newElapsed[order.id] = `${minutes}m ${seconds}s`;
        } else if (
          order.status === "Completed" &&
          order.startedAt &&
          order.completedAt
        ) {
          const diffMs =
            new Date(order.completedAt) - new Date(order.startedAt);
          const minutes = Math.floor(diffMs / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);
          newElapsed[order.id] = `${minutes}m ${seconds}s`;
        }
      });
      setElapsedTimes(newElapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const columns = [
    { title: "Order ID", dataIndex: "id", key: "id" },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name) => name || "Guest",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items) => {
        let arr = [];
        try {
          arr = Array.isArray(items)
            ? items
            : typeof items === "string"
            ? JSON.parse(items)
            : [];
        } catch {
          arr = [];
        }
        return (
          <ul>
            {arr.map((item, i) =>
              typeof item === "string" ? (
                <li key={i}>{item}</li>
              ) : (
                <li key={i}>
                  {item.name} × {item.quantity}
                </li>
              )
            )}
          </ul>
        );
      },
    },
    {
      title: "Assigned Staff",
      dataIndex: "staff_name",
      key: "staff",
      render: (_, record) => (
        <div>
          <strong>{record.staff_name || "N/A"}</strong>
          <br />
          <small>
            {record.staff_role || "-"} | {record.staff_contact || "-"}
          </small>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const isBlinking =
          status === "Pending" || status === "Started Preparing";
        return (
          <span
            className={isBlinking ? "blinking-status" : ""}
            style={{
              padding: "4px 8px",
              borderRadius: 5,
              backgroundColor:
                status === "Pending"
                  ? "#ffccc7"
                  : status === "Started Preparing"
                  ? "#ffe58f"
                  : status === "Cooking"
                  ? "#bae7ff"
                  : status === "Ready"
                  ? "#b7eb8f"
                  : "#d9d9d9",
              color: "#000",
              fontWeight: "500",
            }}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "Elapsed / Total Time",
      key: "elapsed",
      render: (_, record) => (
        <Tag color={record.status === "Completed" ? "green" : "blue"}>
          {elapsedTimes[record.id] || "0m 0s"}
        </Tag>
      ),
    },
    {
      title: "Time",
      dataIndex: "created_at",
      key: "created_at",
      render: (time) => new Date(time).toLocaleString(),
    },
  ];

  const statusCount = (Array.isArray(orders) ? orders : []).reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const pieData = Object.entries(statusCount).map(([key, value]) => ({
    name: key,
    value,
  }));

  return (
    <AppLayout>
      <style>
        {`
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
          .blinking-status {
            animation: blink 1s infinite;
          }
        `}
      </style>

      <div style={{ padding: "20px" }}>
        <h2 style={{ fontWeight: 600 }}>🍳 Kitchen Dashboard (Admin View)</h2>

        {/* Summary Cards */}
        <Row gutter={16} style={{ marginBottom: "20px" }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={totalOrders}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Orders"
                value={pendingCount}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Preparing Orders"
                value={preparingCount}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Completed Orders"
                value={completedCount}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Pie Chart + Table */}
        <Row gutter={24}>
          <Col span={8}>
            <Card title="Order Status Overview" bordered={false}>
              <PieChart width={300} height={300}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>
          </Col>

          <Col span={16}>
            {loading ? (
              <Spin size="large" />
            ) : (
              <Table
                dataSource={orders}
                columns={columns}
                rowKey="id"
                bordered
                pagination={{ pageSize: 5 }}
              />
            )}
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
};

export default KitchenDashboardAdmin;
