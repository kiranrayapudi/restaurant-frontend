// src/Pages/Staff/StockView.jsx
import React, { useEffect, useState } from "react";
import { Table, Tag, Spin } from "antd";
import axios from "axios";

const StockView = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuStock = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://restaurant-backend-kiran.up.railway.app/api/menu"
        );
        // Filter only active items
        const activeItems = (res.data.menu || []).filter(
          (item) => item.status === "Active"
        );

        // Map to table data
        const mappedItems = activeItems.map((item) => ({
          key: item.id,
          item: item.name,
          quantity: item.stock ?? 0,
          status:
            item.stock === 0
              ? "Out of Stock"
              : item.stock <= item.threshold
              ? "Low Stock"
              : "Available",
        }));

        setStockItems(mappedItems);
      } catch (err) {
        console.error("Failed to fetch menu stock:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuStock();
  }, []);

  const columns = [
    { title: "Item", dataIndex: "item", key: "item" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Available"
            ? "green"
            : status === "Low Stock"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: "block", marginTop: 50, textAlign: "center" }}
      />
    );
  }

  return (
    <>
      <h2>📦 Menu Stock Availability</h2>
      <Table
        columns={columns}
        dataSource={stockItems}
        pagination={false}
        rowKey="key"
      />
    </>
  );
};

export default StockView;
