import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Spin, Modal } from "antd";
import axios from "axios";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import AppLayout from "../Components/Layout/AppLayout";

const { confirm } = Modal;

const ContactsAdmin = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/contacts"
      );
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error("Fetch Contacts Error:", err);
      message.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Soft delete contact
  const handleDelete = (id) => {
    confirm({
      title: "Are you sure you want to delete this contact?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/contacts/${id}`);
          message.success("Contact deleted successfully");
          fetchContacts();
        } catch (err) {
          console.error("Delete Error:", err);
          message.error("Failed to delete contact");
        }
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ padding: 20 }}>
        <h2>Contact Messages</h2>
        {loading ? (
          <Spin
            size="large"
            style={{ display: "block", margin: "50px auto" }}
          />
        ) : (
          <Table
            dataSource={contacts}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 5 }}
            scroll={{
              x: 800, // horizontal scroll width (adjust if needed)
              y: window.innerWidth < 768 ? 400 : undefined, // vertical scroll only on mobile
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ContactsAdmin;
