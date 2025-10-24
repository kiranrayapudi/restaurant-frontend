import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  TimePicker,
  Select,
  Space,
  Card,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";

const TableBooking = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch tables with booking info
  const fetchTables = async () => {
    try {
      setLoading(true);
      // TableBooking.jsx
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/bookings/tables-with-booking"
      );

      setTables(res.data.tables);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Open booking modal
  const handleBookTable = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  // Submit booking
  const handleSubmit = async (values) => {
    try {
      const payload = {
        table_id: values.table,
        customer_name: values.name,
        booking_time: values.time.format("YYYY-MM-DD HH:mm:ss"),
      };

      await axios.post(
        "https://restaurant-backend-kiran.up.railway.app/api/bookings",
        payload
      );
      toast.success("Table booked successfully!");
      setIsModalOpen(false);
      fetchTables();
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.error || "Failed to book table");
    }
  };

  // Complete booking
  // Complete / Reset Booking
  const handleComplete = async (bookingId) => {
    try {
      await axios.patch(
        `https://restaurant-backend-kiran.up.railway.app/api/bookings/complete/${bookingId}`
      );
      toast.success("Booking completed and table is now available!");
      fetchTables(); // Refresh the table list
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete booking");
    }
  };

  const columns = [
    {
      title: "Table",
      dataIndex: "table_number",
      key: "table_number",
      render: (text) => <span>{text}</span>, // QR removed
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "green";
        if (status === "reserved") color = "orange";
        if (status === "occupied") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name) => name || "-",
    },
    {
      title: "Booking Time",
      dataIndex: "booking_time",
      key: "booking_time",
      render: (time) => (time ? dayjs(time).format("hh:mm A") : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        record.status === "booked" || record.status === "reserved" ? (
          <Button
            type="primary"
            danger
            onClick={() => handleComplete(record.booking_id)}
          >
            Complete
          </Button>
        ) : (
          "-"
        ),
    },
  ];

  const availableTables = tables
    .filter((t) => t.status === "available")
    .map((t) => ({ label: t.table_number, value: t.id }));

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>📅 Table Bookings</h2>
        <Button
          type="primary"
          onClick={handleBookTable}
          disabled={availableTables.length === 0}
        >
          + Book Table
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tables}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
      />

      {/* Booking Modal */}
      <Modal
        title="Book a Table"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Book"
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="table"
            label="Select Table"
            rules={[{ required: true, message: "Please select a table" }]}
          >
            <Select
              placeholder="Select available table"
              options={availableTables}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: "Please enter customer name" }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>

          <Form.Item
            name="time"
            label="Booking Time"
            rules={[{ required: true, message: "Please select booking time" }]}
          >
            <TimePicker format="hh:mm A" use12Hours />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TableBooking;
