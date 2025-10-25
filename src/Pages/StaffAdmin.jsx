import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Space,
} from "antd";
import { toast } from "react-toastify";
import AppLayout from "../Components/Layout/AppLayout";
import {
  fetchStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from "../Redux/Slices/staffSlice";

const { Option } = Select;

const StaffAdmin = () => {
  const dispatch = useDispatch();
  const { list: staff, loading } = useSelector((state) => state.staff);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

  const openModal = (staffRecord = null) => {
    if (staffRecord) {
      setEditingStaff(staffRecord);
      form.setFieldsValue({
        name: staffRecord.name,
        role: staffRecord.role,
        contact: staffRecord.contact,
      });
    } else {
      setEditingStaff(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleAddEditStaff = async (values) => {
    try {
      if (editingStaff) {
        await dispatch(
          updateStaff({ id: editingStaff.id, data: values })
        ).unwrap();
        toast.success(`Staff ${values.name} updated successfully!`);
      } else {
        await dispatch(addStaff(values)).unwrap();
        toast.success(`Staff ${values.name} added!`);
      }
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteStaff(id)).unwrap();
      message.success("Staff deleted successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete staff!");
    }
  };

  const columns = [
    { title: "Staff ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
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
        <Space direction={isMobile ? "vertical" : "horizontal"}>
          <Button size="small" onClick={() => openModal(record)} block>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this staff?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger block>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeCount = staff.filter((s) => s.status === "Active").length;
  const inactiveCount = staff.length - activeCount;

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
          👨‍🍳 Staff Management (Admin View)
        </h2>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Active Staff"
                value={activeCount}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Inactive Staff"
                value={inactiveCount}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>

        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={() => openModal()}
        >
          + Add Staff
        </Button>

        <Card title="Staff List" bordered>
          <Table
            dataSource={staff}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            bordered
            scroll={
              window.innerWidth < 768 ? { x: "max-content", y: 400 } : undefined
            }
          />
        </Card>

        <Modal
          title={
            <div
              style={{ textAlign: isMobile ? "right" : "left", width: "100%" }}
            >
              {editingStaff ? "Edit Staff" : "Add New Staff"}
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddEditStaff}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter staff name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select placeholder="Select Role">
                <Option value="Chef">Chef</Option>
                <Option value="Waiter">Waiter</Option>
                <Option value="Helper">Helper</Option>
                <Option value="Manager">Manager</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Contact"
              name="contact"
              rules={[
                { required: true, message: "Please enter contact number" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {editingStaff ? "Update Staff" : "Add Staff"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default StaffAdmin;
