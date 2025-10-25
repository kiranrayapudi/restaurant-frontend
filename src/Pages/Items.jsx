import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Form,
  Select,
  Table,
  Modal,
  Card,
  Space,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppLayout from "../Components/Layout/AppLayout";
import axios from "axios";

const { Option } = Select;
const API_URL = "https://restaurant-backend-kiran.up.railway.app/api/items";

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const itemTypes = [
    "Grains",
    "Pulses",
    "Oil",
    "Vegetables",
    "Spices",
    "Dairy",
    "Others",
  ];
  const unitTypes = ["kg", "g", "litre", "ml", "pcs", "packet"];

  // Fetch items
  const fetchItems = async () => {
    try {
      const res = await axios.get(API_URL);
      setItems(res.data);
    } catch (error) {
      toast.error("Failed to fetch items");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Open modal for adding new item
  const openAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ status: "Active" }); // default Active
    setIsModalVisible(true);
  };

  // Handle Add / Update
  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await axios.put(`${API_URL}/${editingItem.item_id}`, values);
        toast.success(`Item "${values.name}" updated successfully!`);
      } else {
        const res = await axios.post(API_URL, values);
        values.item_id = res.data.item_id;
        toast.success(`Item "${values.name}" added successfully!`);
      }
      setIsModalVisible(false);
      setEditingItem(null);
      form.resetFields();
      fetchItems();
    } catch (error) {
      toast.error("Operation failed");
      console.error(error);
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...item,
      status: item.status || "Active",
    });
  };

  // Soft Delete (mark inactive)
  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete Item",
      content: `"${item.name}" will be marked as inactive.`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          // Call DELETE route for soft delete
          await axios.delete(`${API_URL}/${item.item_id}`);
          toast.success(`Item "${item.name}" marked as inactive!`);
          fetchItems();
        } catch (error) {
          toast.error("Failed to delete item");
          console.error(error);
        }
      },
    });
  };

  const columns = [
    { title: "S.No", render: (_, __, index) => index + 1 },
    { title: "Item Name", dataIndex: "name" },
    { title: "Category", dataIndex: "category" },
    { title: "Unit", dataIndex: "unit" },
    { title: "Thresholds", dataIndex: "thresholds" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <ToastContainer position="top-right" autoClose={2000} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h3>Items Management</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add Item
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="item_id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 700 }}
        />
      </Card>

      <Modal
        open={isModalVisible}
        title={editingItem ? "Edit Item" : "Add New Item"}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingItem(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
            <Input placeholder="Enter item name" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select category">
              {itemTypes.map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
            <Select placeholder="Select unit">
              {unitTypes.map((u) => (
                <Option key={u} value={u}>
                  {u}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="thresholds"
            label="Thresholds"
            rules={[{ required: true }]}
          >
            <Input placeholder="Low stock limit (e.g. 10, 20)" />
          </Form.Item>

          {/* Only show Status when editing */}
          {editingItem && (
            <Form.Item name="status" label="Status">
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingItem ? "Update Item" : "Add Item"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default ItemsPage;
