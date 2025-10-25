import React, { useEffect, useState } from "react";
import { Table, Card, Row, Col, Statistic, Spin, Tag } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import AppLayout from "../Components/Layout/AppLayout";

const BillingAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pendingBillsCount, setPendingBillsCount] = useState(0);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "https://restaurant-backend-kiran.up.railway.app/api/orders"
        );
        const data = res.data.orders || [];

        setOrders(data);

        // Filter completed orders to create bills
        const completedOrders = data.filter((o) => o.status === "Completed");

        const bills = completedOrders.map((o) => ({
          id: o.id,
          customer: o.customer_name || "Guest",
          total: o.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          status: o.status,
          created_at: o.created_at,
        }));

        setBills(bills);
        setTotalRevenue(bills.reduce((sum, b) => sum + b.total, 0));

        setPendingBillsCount(data.length - completedOrders.length);

        // Aggregate monthly revenue
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const monthsMap = monthNames.reduce(
          (acc, m) => ({ ...acc, [m]: 0 }),
          {}
        );
        bills.forEach((b) => {
          const month = monthNames[new Date(b.created_at).getMonth()];
          monthsMap[month] += b.total;
        });

        setMonthlyData(
          Object.entries(monthsMap).map(([month, value]) => ({
            month,
            Revenue: value,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const columns = [
    { title: "Bill ID", dataIndex: "id", key: "id" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    { title: "Total (₹)", dataIndex: "total", key: "total" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "Completed" ? "green" : "orange"}
          style={{ fontWeight: 600, fontSize: 14 }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  if (loading)
    return (
      <Spin
        size="large"
        style={{ marginTop: 100, display: "block", textAlign: "center" }}
      />
    );

  return (
    <AppLayout>
      <div style={{ padding: 20 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 20 }}>
          💰 Billing Dashboard (Admin)
        </h2>

        {/* Summary Cards */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={totalRevenue}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
                prefix="₹"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Completed Bills"
                value={bills.length}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Pending Bills"
                value={pendingBillsCount}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Monthly Revenue Graph + Table */}
        <Row gutter={24}>
          <Col xs={24} md={10}>
            <Card title="Monthly Revenue Overview" bordered={false}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="Revenue" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} md={14}>
            <Card title="All Payments" bordered>
              <Table
                dataSource={bills}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                bordered
                scroll={{ y: 300 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
};

export default BillingAdmin;
