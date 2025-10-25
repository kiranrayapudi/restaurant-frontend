import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Spin,
  Tag,
  Popconfirm,
  Space,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import AppLayout from "../Components/Layout/AppLayout";

const { Option } = Select;

const MenuItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/menu"
      );
      setMenuItems(Array.isArray(res.data) ? res.data : res.data.menu || []);
    } catch (err) {
      message.error("Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Add / Update item
  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        image: values.image || "",
        description: values.description || "",
      };

      if (editingItem) {
        await axios.put(
          `https://restaurant-backend-kiran.up.railway.app/api/menu/${editingItem.id}`,
          payload
        );
        message.success("Menu item updated successfully!");
      } else {
        await axios.post(
          "https://restaurant-backend-kiran.up.railway.app/api/menu",
          payload
        );
        message.success("Menu item added successfully!");
      }

      setModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      fetchMenuItems();
    } catch (err) {
      message.error("Failed to save menu item");
    }
  };

  // Edit handler
  const handleEdit = (record) => {
    setEditingItem(record);
    setModalVisible(true);
    form.setFieldsValue(record);
  };

  // Cancel modal
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Price (₹)", dataIndex: "price", key: "price" },

    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock, record) => {
        let color = stock <= record.threshold ? "red" : "green";
        let label = stock <= record.threshold ? `Low (${stock})` : stock;
        return <span style={{ color, fontWeight: "bold" }}>{label}</span>;
      },
    },

    {
      title: "Threshold",
      dataIndex: "threshold",
      key: "threshold",
      render: (threshold) => <span style={{ color: "blue" }}>{threshold}</span>,
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          style={{
            color: status === "Active" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {status}
        </span>
      ),
    },

    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (url) => (
        <img
          src={url}
          alt="menu"
          style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ marginRight: 8 }}
            ></Button>
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}></Button>
            </Popconfirm>
          </Space>
        </>
      ),
    },
  ];

  // Soft delete handler
  const handleDelete = async (id) => {
    try {
      await axios.patch(
        `https://restaurant-backend-kiran.up.railway.app/api/menu/${id}/inactive`
      );
      message.success("Menu item marked as inactive");
      fetchMenuItems();
    } catch (err) {
      message.error("Failed to delete menu item");
    }
  };

  return (
    <AppLayout>
      <h1 style={{ marginBottom: 20 }}>🍴 Menu Items</h1>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 20 }}
      >
        Add Menu Item
      </Button>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={menuItems.filter((item) => item.status !== "deleted")}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Enter menu item name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Select category" }]}
          >
            <Select placeholder="Select category">
              <Option value="Veg Starters">Veg Starters</Option>
              <Option value="Non-Veg Starters">Non-Veg Starters</Option>
              <Option value="Biryanis">Biryanis</Option>
              <Option value="VegBiryanis">Veg-Biryanis</Option>
              <Option value="Drinks">Drinks</Option>
              <Option value="Fried Rice">Fried Rice</Option>
              <Option value="Desserts">Desserts</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (₹)"
            rules={[{ required: true, message: "Enter price" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Stock Quantity"
            rules={[{ required: true, message: "Enter stock quantity" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="threshold"
            label="Stock Threshold"
            tooltip="Alert level when stock is low"
            rules={[{ required: true, message: "Enter threshold" }]}
          >
            <InputNumber min={1} defaultValue={10} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image URL"
            rules={[{ required: true, message: "Enter image URL" }]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default MenuItems;
