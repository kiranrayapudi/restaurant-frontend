import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import axios from "axios";
import { toast } from "react-toastify";

const KitchenStaff = () => {
  const [orders, setOrders] = useState([]);
  const [elapsedTimes, setElapsedTimes] = useState({});

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/kitchen/orders"
      );
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch kitchen orders");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Update elapsed times
  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsed = {};
      orders.forEach((order) => {
        if (order.status === "Cooking" && order.startedAt) {
          const diffMs = new Date() - new Date(order.startedAt);
          const minutes = Math.floor(diffMs / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);
          newElapsed[order.id] = `${minutes}m ${seconds}s`;
        } else if (
          order.status === "Completed" &&
          order.startedAt &&
          order.completedAt
        ) {
          const diffMs =
            new Date(order.completedAt) - new Date(order.startedAt);
          const minutes = Math.floor(diffMs / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);
          newElapsed[order.id] = `${minutes}m ${seconds}s`;
        }
      });
      setElapsedTimes(newElapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const columns = [
    { title: "Table", dataIndex: "table_number", key: "table" },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items) =>
        Array.isArray(items) ? items.join(", ") : JSON.parse(items).join(", "),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "New"
            ? "blue"
            : status === "Started Preparing"
            ? "purple"
            : status === "Cooking"
            ? "orange"
            : status === "Ready"
            ? "cyan"
            : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Preparing Time",
      key: "time",
      render: (_, record) => {
        if (record.status === "Cooking") {
          return <Tag color="blue">{elapsedTimes[record.id] || "0m 0s"}</Tag>;
        } else if (record.status === "Completed") {
          return <Tag color="green">Done</Tag>;
        }
        return <Tag color="gray">-</Tag>;
      },
    },
  ];

  return (
    <>
      <h2>👨‍🍳 Kitchen Staff Orders (Live View)</h2>
      <Table
        columns={columns}
        dataSource={orders}
        pagination={false}
        rowKey="id"
      />
    </>
  );
};

export default KitchenStaff;
