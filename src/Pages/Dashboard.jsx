import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Typography, Progress } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import AppLayout from "../Components/Layout/AppLayout";

const { Title, Text } = Typography;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [revenueToday, setRevenueToday] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [topItems, setTopItems] = useState([]);
  const [menuStock, setMenuStock] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [ordersTrend, setOrdersTrend] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1️⃣ Fetch orders
        const ordersRes = await axios.get(
          "https://restaurant-backend-kiran.up.railway.app/api/orders"
        );
        const orders = ordersRes.data.orders || [];

        // 2️⃣ Fetch menu
        const menuRes = await axios.get(
          "https://restaurant-backend-kiran.up.railway.app/api/menu"
        );
        const menuItems = menuRes.data.menu || [];
        setMenuStock(menuItems);

        const today = new Date().toISOString().slice(0, 10);
        const todaysOrders = orders.filter(
          (o) => o.created_at.slice(0, 10) === today
        );

        // Revenue today
        const revenueTodayCalc = todaysOrders.reduce((sum, order) => {
          const items = Array.isArray(order.items)
            ? order.items
            : JSON.parse(order.items || "[]");
          return (
            sum +
            items.reduce((t, i) => t + (i.price || 0) * (i.quantity || 1), 0)
          );
        }, 0);
        setRevenueToday(revenueTodayCalc);
        setTotalOrders(todaysOrders.length);

        // Top selling items (all orders)
        const itemCount = {};
        orders.forEach((order) => {
          const items = Array.isArray(order.items)
            ? order.items
            : JSON.parse(order.items || "[]");
          items.forEach((item) => {
            if (!itemCount[item.name]) itemCount[item.name] = 0;
            itemCount[item.name] += item.quantity || 1;
          });
        });
        const sortedItems = Object.entries(itemCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setTopItems(sortedItems);

        // Last 7 days trend
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().slice(0, 10);
        }).reverse();

        // Revenue trend
        setRevenueTrend(
          last7Days.map((day) => {
            const dailyOrders = orders.filter(
              (o) => o.created_at.slice(0, 10) === day
            );
            const dailyRevenue = dailyOrders.reduce((sum, order) => {
              const items = Array.isArray(order.items)
                ? order.items
                : JSON.parse(order.items || "[]");
              return (
                sum +
                items.reduce(
                  (t, i) => t + (i.price || 0) * (i.quantity || 1),
                  0
                )
              );
            }, 0);
            return { date: day, revenue: dailyRevenue };
          })
        );

        // Orders trend
        setOrdersTrend(
          last7Days.map((day) => {
            const dailyOrders = orders.filter(
              (o) => o.created_at.slice(0, 10) === day
            );
            return { date: day, orders: dailyOrders.length };
          })
        );
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date);
      const formattedDate = `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}`;
      return (
        <div
          style={{ background: "#fff", border: "1px solid #ccc", padding: 10 }}
        >
          <p style={{ fontWeight: 600 }}>{formattedDate}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.stroke }}>
              {p.name}: {p.value}
              {p.dataKey === "revenue" ? " ₹" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <AppLayout>
      <Title level={2} style={{ marginBottom: 24 }}>
        Admin Dashboard
      </Title>

      <Row gutter={[24, 24]}>
        {/* Revenue Today */}
        <Col xs={24} md={12}>
          <Card
            title="Revenue Today"
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <Title level={3}>₹ {revenueToday.toFixed(2)}</Title>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                <YAxis />
                <ReTooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0088FE"
                  strokeWidth={3}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Total Orders */}
        <Col xs={24} md={12}>
          <Card
            title="Total Orders Today"
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <Title level={3}>{totalOrders}</Title>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ordersTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                <YAxis />
                <ReTooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#00C49F"
                  strokeWidth={3}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Menu Stock */}
        <Col xs={24} md={12}>
          <Card title="Menu Stock" bordered={false} style={{ borderRadius: 8 }}>
            {menuStock.map((item) => {
              const maxStock = item.threshold || item.stock || 1;
              const percent = Math.min((item.stock / maxStock) * 50, 50);
              return (
                <div key={item.id} style={{ marginBottom: 12 }}>
                  <Text strong>{item.name}</Text>
                  <Progress
                    percent={percent}
                    strokeColor={{
                      "0%": "#108ee9",
                      "50%": "#87d068",
                      "100%": "#f50",
                    }}
                    showInfo
                    strokeWidth={12}
                    status="active"
                    trailColor="#f0f0f0"
                  />
                </div>
              );
            })}
          </Card>
        </Col>

        {/* Top Selling Items */}
        <Col xs={24} md={12}>
          <Card
            title="Top Selling Items"
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            {topItems.length === 0 ? (
              <Text>No sales today</Text>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topItems}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    label
                  >
                    {topItems.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
};

export default Dashboard;
