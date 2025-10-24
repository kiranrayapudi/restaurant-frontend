// src/Pages/Staff/OnlineBooking.jsx
import React, { useEffect, useState } from "react";
import { Table, Spin, Card } from "antd";
import axios from "axios";
import { toast } from "react-toastify";

const OnlineBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch online bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/online-bookings"
      );
      // 🔹 replace with your backend endpoint
      setBookings(res.data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to fetch online bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Columns for Ant Design table
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
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) =>
        new Date(date).toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (time) => {
        // If time is stored separately
        if (time) return time;
        // Or if combined with date
        return new Date(time).toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "Guests",
      dataIndex: "guests",
      key: "guests",
    },
  ];

  return (
    <div>
      <Card title="Online Bookings" style={{ margin: 20 }}>
        {loading ? (
          <Spin tip="Loading..." />
        ) : (
          <Table
            dataSource={bookings}
            columns={columns}
            rowKey={(record) => record.id}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>
    </div>
  );
};

export default OnlineBooking;
