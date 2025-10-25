// src/Pages/Admin/Stock.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Row,
  Col,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Statistic,
  Divider,
  Typography,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AppLayout from "../Components/Layout/AppLayout";
import { toast } from "react-toastify";
import axios from "axios";

const { Title } = Typography;

const StockPage = () => {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);

        // Fetch items and vendor orders
        const [itemsRes, vendorsRes] = await Promise.all([
          axios.get(
            "https://restaurant-backend-kiran.up.railway.app/api/items"
          ),
          axios.get(
            "https://restaurant-backend-kiran.up.railway.app/api/vendor-orders"
          ),
        ]);

        const itemsData = Array.isArray(itemsRes.data)
          ? itemsRes.data
          : itemsRes.data.items || [];

        const vendorsData = Array.isArray(vendorsRes.data)
          ? vendorsRes.data
          : vendorsRes.data.vendors || [];

        const mappedData = itemsData.map((item) => {
          const quantity = Number(item.stock || 0);

          // Correct mapping: item.item_id matches vendor order item_id
          const itemVendors = vendorsData.filter(
            (v) => v.item_id === item.item_id && v.status === "Delivered"
          );

          const vendorOrdered = itemVendors.reduce(
            (sum, v) => sum + Number(v.quantity || 0),
            0
          );

          const amount = itemVendors.reduce(
            (sum, v) => sum + Number(v.amount || 0),
            0
          );

          return {
            id: item.item_id,
            name: item.name,
            category: item.category || "Uncategorized",
            quantity,
            dailyUsage: Math.max(Math.round(quantity / 7), 1),
            vendorOrdered,
            amount,
          };
        });

        setStocks(mappedData);
      } catch (err) {
        console.error("Failed to fetch items/vendors:", err);
        toast.error("Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Summary
  const totalItems = stocks.length;
  const totalQuantity = stocks.reduce((sum, i) => sum + i.quantity, 0);
  const totalUsage = stocks.reduce((sum, i) => sum + i.dailyUsage, 0);
  const totalAmount = stocks.reduce((sum, i) => sum + i.amount, 0);

  // Pie data
  const pieData = stocks.reduce((acc, item) => {
    const existing = acc.find((a) => a.name === item.category);
    if (existing) existing.value += item.quantity;
    else acc.push({ name: item.category, value: item.quantity });
    return acc;
  }, []);

  // Bar chart data
  const barData = stocks.map((item) => ({
    name: item.name,
    "Daily Usage": item.dailyUsage,
    "Vendor Ordered": item.vendorOrdered,
  }));

  // Table columns
  const columns = [
    { title: "Item Name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) =>
        qty <= 10 ? (
          <Tag color="red">{qty} (Low)</Tag>
        ) : (
          <Tag color="green">{qty}</Tag>
        ),
    },
    {
      title: "Daily Usage",
      dataIndex: "dailyUsage",
      key: "dailyUsage",
      render: (u) => `${u} /day`,
    },
    {
      title: "Vendor Ordered",
      dataIndex: "vendorOrdered",
      key: "vendorOrdered",
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
      key: "amount",
      render: (amt) => `₹${amt.toFixed(2)}`,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) =>
        record.quantity <= 10 ? (
          <Tag color="volcano">Low Stock</Tag>
        ) : (
          <Tag color="green">Available</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to remove this stock item?",
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        setStocks(stocks.filter((item) => item.id !== id));
        toast.success("Item removed");
      },
    });
  };

  const handleSubmit = (values) => {
    if (editingItem) {
      setStocks(
        stocks.map((item) =>
          item.id === editingItem.id ? { ...editingItem, ...values } : item
        )
      );
      toast.success("Stock updated successfully!");
    } else {
      setStocks([...stocks, { id: Date.now(), ...values }]);
      toast.success("Stock added successfully!");
    }
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <AppLayout headerContent={<h3>📦 Admin Stock Monitor</h3>}>
      <div style={{ padding: 15 }}>
        {/* Summary Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card
              bordered={false}
              style={{
                background: "#f0f5ff",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <Statistic title="Total Items" value={totalItems} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card
              bordered={false}
              style={{
                background: "#e6fffb",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <Statistic title="Total Quantity" value={totalQuantity} />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card
              bordered={false}
              style={{
                background: "#fffbe6",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <Statistic
                title="Daily Usage"
                value={totalUsage}
                suffix="/day"
                prefix={<ArrowUpOutlined style={{ color: "#faad14" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card
              bordered={false}
              style={{
                background: "#f6ffed",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <Statistic
                title="Total Amount"
                value={totalAmount.toFixed(2)}
                prefix="₹"
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Charts */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} md={12}>
            <Card
              title="📊 Stock Distribution by Category"
              style={{ borderRadius: 12 }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={(entry) => entry.name}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="📊 Most Used Items" style={{ borderRadius: 12 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="Daily Usage"
                    name="Daily Usage"
                    fill="#82ca9d"
                  />
                  <Bar
                    dataKey="Vendor Ordered"
                    name="Vendor Ordered"
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Stock Table */}
        <Card
          style={{ borderRadius: 10 }}
          bodyStyle={{ padding: 16 }}
          title={
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap", // this ensures it wraps on small screens
                gap: 8,
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                📊 Current Stock Overview
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Add Stock
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={stocks}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Modal */}
        <Modal
          title={editingItem ? "Edit Stock Item" : "Add New Stock"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingItem(null);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          okText={editingItem ? "Update" : "Add"}
        >
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Item Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Tomato" />
            </Form.Item>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Vegetables" />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="dailyUsage" label="Daily Usage">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="vendorOrdered" label="Vendor Ordered">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="amount" label="Amount (₹)">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default StockPage;
