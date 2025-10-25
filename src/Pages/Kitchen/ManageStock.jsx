import React, { useEffect, useState } from "react";
import { Table, Card, Tag } from "antd";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const ManageStock = () => {
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    try {
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/items"
      );
      setStockItems(res.data);
    } catch (err) {
      toast.error("Error fetching stock items");
    }
  };

  const columns = [
    { title: "S.No", render: (_, __, index) => index + 1 },
    { title: "Item", dataIndex: "name" },
    { title: "Category", dataIndex: "category" },
    { title: "Unit", dataIndex: "unit" },
    {
      title: "Stock",
      dataIndex: "stock",
      render: (stock, record) => {
        const color = stock <= record.thresholds ? "red" : "green";
        return <Tag color={color}>{stock}</Tag>;
      },
    },
    { title: "Threshold", dataIndex: "thresholds" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />
      <h3>📦 Manage Stock</h3>

      <Card>
        <Table
          columns={columns}
          dataSource={stockItems}
          rowKey="item_id"
          pagination={false}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default ManageStock;
