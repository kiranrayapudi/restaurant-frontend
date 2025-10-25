// src/Pages/TablesPage.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Input, Image, Space, message } from "antd";
import axios from "axios";
import AppLayout from "../Components/Layout/AppLayout";

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState("");

  // Fetch all tables
  const fetchTables = async () => {
    try {
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/tables"
      );
      setTables(res.data.tables || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch tables");
    }
  };

  // Add new table
  const addTable = async () => {
    if (!newTableNumber) return message.warning("Enter table number");
    try {
      const res = await axios.post(
        "https://restaurant-backend-kiran.up.railway.app/api/tables",
        {
          table_number: newTableNumber,
        }
      );
      setTables((prev) => [...prev, res.data.table]);
      setNewTableNumber("");
      message.success("Table added successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to add table");
    }
  };

  // Generate QR for table
  const generateQR = async (tableId) => {
    try {
      const res = await axios.post(
        `https://restaurant-backend-kiran.up.railway.app/api/qr/generate/${tableId}`
      );
      fetchTables(); // refresh table list
      message.success("QR code generated");
    } catch (err) {
      console.error(err);
      message.error("Failed to generate QR");
    }
  };

  // Download QR code image
  const downloadQR = (qrDataUrl, tableNumber) => {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `Table-${tableNumber}-QR.png`;
    link.click();
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const columns = [
    {
      title: "Table Number",
      dataIndex: "table_number",
      key: "table_number",
      render: (num) => `${num}`, // Add prefix here
    },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "QR Code",
      dataIndex: "qr_code",
      key: "qr_code",
      render: (qr) => qr && <Image width={100} src={qr} />,
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Button type="primary" onClick={() => generateQR(record.id)}>
          Generate QR
        </Button>
      ),
    },
  ];

  return (
    <AppLayout headerContent={<h2>Manage Tables & QR Codes</h2>}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Table Number"
          value={newTableNumber}
          onChange={(e) => setNewTableNumber(e.target.value)}
          type="number"
        />
        <Button type="primary" onClick={addTable}>
          Add Table
        </Button>
      </Space>

      <Table
        dataSource={tables}
        columns={columns}
        rowKey="id"
        scroll={{ x: 500 }}
      />
    </AppLayout>
  );
};

export default TablesPage;
