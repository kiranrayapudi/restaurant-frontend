// src/Pages/Admin/Vendors.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  message,
  Card,
  Form,
  Input,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import AppLayout from "../Components/Layout/AppLayout";

const BASE_URL = "https://restaurant-backend-kiran.up.railway.app/api/vendors";

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewingVendor, setViewingVendor] = useState(null);

  const [form] = Form.useForm();

  // Fetch all vendors
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL);
      setVendors(res.data);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Handlers
  const handleView = (vendor) => {
    setViewingVendor(vendor);
    setViewModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this vendor?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await axios.delete(`${BASE_URL}/${id}`);
          message.success("Vendor deleted successfully");
          fetchVendors();
        } catch (err) {
          message.error(err?.response?.data?.message || "Delete failed");
        }
      },
    });
  };

  const handleAddVendor = async (values) => {
    try {
      await axios.post(BASE_URL, { ...values, status: "Active" });
      message.success("Vendor added successfully!");
      setAddModalVisible(false);
      form.resetFields();
      fetchVendors();
    } catch (err) {
      message.error(err?.response?.data?.message || "Add vendor failed");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "vendor_name", key: "vendor_name" },
    { title: "Mobile", dataIndex: "mobile_number", key: "mobile_number" },
    {
      title: "License Number",
      dataIndex: "license_number",
      key: "license_number",
    },
    {
      title: "Contact Person",
      dataIndex: "contact_person",
      key: "contact_person",
    },
    { title: "GST", dataIndex: "gst_number", key: "gst_number" },
    { title: "PAN", dataIndex: "pan_number", key: "pan_number" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            View
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout headerContent={<h3>Vendors Management</h3>}>
      <Card
        title="Manage Your Vendors"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            Add Vendor
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={vendors}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* View Vendor Modal */}
      <Modal
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        title="Vendor Details"
      >
        {viewingVendor ? (
          <div>
            <p>
              <b>Name:</b> {viewingVendor.vendor_name}
            </p>
            <p>
              <b>Mobile:</b> {viewingVendor.mobile_number}
            </p>
            <p>
              <b>License Number:</b> {viewingVendor.license_number}
            </p>
            <p>
              <b>Contact Person:</b> {viewingVendor.contact_person}
            </p>
            <p>
              <b>Contact Mobile:</b> {viewingVendor.contact_mobile}
            </p>
            <p>
              <b>Contact Email:</b> {viewingVendor.contact_email}
            </p>
            <p>
              <b>GST Number:</b> {viewingVendor.gst_number}
            </p>
            <p>
              <b>PAN Number:</b> {viewingVendor.pan_number}
            </p>
            <p>
              <b>Full Address:</b> {viewingVendor.full_address}
            </p>
            <p>
              <b>Status:</b> {viewingVendor.status}
            </p>
          </div>
        ) : (
          <p>No vendor selected</p>
        )}
      </Modal>

      {/* Add Vendor Modal */}
      <Modal
        open={addModalVisible}
        title="Add New Vendor"
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        width={700}
        bodyStyle={{ maxHeight: "75vh", overflowY: "auto", padding: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddVendor}>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Vendor Info" bordered={false}>
                <Form.Item
                  name="vendor_name"
                  label="Vendor Name"
                  rules={[
                    { required: true, message: "Please enter vendor name" },
                  ]}
                >
                  <Input placeholder="ABC Suppliers" />
                </Form.Item>
                <Form.Item
                  name="mobile_number"
                  label="Mobile Number"
                  rules={[
                    { required: true, message: "Please enter mobile number" },
                  ]}
                >
                  <Input placeholder="9876543210" maxLength={10} />
                </Form.Item>
                <Form.Item
                  name="license_number"
                  label="License Number"
                  rules={[
                    { required: true, message: "Please enter license number" },
                  ]}
                >
                  <Input placeholder="LIC12345" />
                </Form.Item>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Contact Info" bordered={false}>
                <Form.Item
                  name="contact_person"
                  label="Contact Person"
                  rules={[
                    { required: true, message: "Please enter contact person" },
                  ]}
                >
                  <Input placeholder="John Doe" />
                </Form.Item>
                <Form.Item
                  name="contact_mobile"
                  label="Contact Mobile"
                  rules={[
                    { required: true, message: "Please enter contact mobile" },
                  ]}
                >
                  <Input placeholder="9876543210" maxLength={10} />
                </Form.Item>
                <Form.Item
                  name="contact_email"
                  label="Contact Email"
                  rules={[
                    { required: true, message: "Please enter contact email" },
                    { type: "email", message: "Enter valid email" },
                  ]}
                >
                  <Input placeholder="john@example.com" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card title="Tax Details" bordered={false}>
                <Form.Item
                  name="gst_number"
                  label="GST Number"
                  rules={[
                    { required: true, message: "Please enter GST number" },
                  ]}
                >
                  <Input placeholder="27ABCDE1234J1Z5" />
                </Form.Item>
                <Form.Item
                  name="pan_number"
                  label="PAN Number"
                  rules={[
                    { required: true, message: "Please enter PAN number" },
                  ]}
                >
                  <Input placeholder="ABCDE1234J" />
                </Form.Item>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Address" bordered={false}>
                <Form.Item
                  name="full_address"
                  label="Full Address"
                  rules={[
                    { required: true, message: "Please enter full address" },
                  ]}
                >
                  <Input.TextArea placeholder="123 Main Street, City, State, 500001" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block>
              Add Vendor
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default VendorsPage;
