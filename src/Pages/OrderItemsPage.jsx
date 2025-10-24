import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
} from "antd";
import AppLayout from "../Components/Layout/AppLayout";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const { Option } = Select;

const OrderItemsPage = () => {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchVendors();
    fetchOrders();
  }, []);

  const fetchItems = async () => {
    const res = await axios.get(
      "https://restaurant-backend-kiran.up.railway.app/api/items"
    );
    setItems(res.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get(
      "https://restaurant-backend-kiran.up.railway.app/api/vendors"
    );
    setVendors(res.data);
  };

  const fetchOrders = async () => {
    const res = await axios.get(
      "https://restaurant-backend-kiran.up.railway.app/api/vendor-orders"
    );
    setOrders(res.data);
  };

  const handleAddOrder = async (values) => {
    try {
      const item = items.find((i) => i.item_id === values.item);
      if (!item) return toast.error("Invalid item");

      await axios.post(
        "https://restaurant-backend-kiran.up.railway.app/api/vendor-orders",
        {
          item_id: item.item_id,
          vendor: values.vendor,
          quantity: values.quantity,
        }
      );

      toast.success(`Order placed for ${item.name}`);

      // Fetch updated orders from backend to get correct stock
      fetchOrders();

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      toast.error("Error adding order");
    }
  };

  const columns = [
    { title: "S.No", render: (_, __, index) => index + 1 },
    { title: "Vendor", dataIndex: "vendor" },
    { title: "Item", dataIndex: "item_name" },
    { title: "Unit", dataIndex: "unit" },
    { title: "Quantity", dataIndex: "quantity" },
    { title: "Amount", dataIndex: "amount" },
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
      render: (status) => {
        const color =
          status === "Pending"
            ? "orange"
            : status === "Delivered"
            ? "green"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            disabled={record.status !== "Pending"}
            onClick={() => {
              setCurrentOrder(record);
              setAmountModalVisible(true);
              form.setFieldsValue({
                vendor: record.vendor,
                quantity: record.quantity,
                amount: record.amount || 0,
              });
            }}
          >
            Mark Delivered
          </Button>
          <Button
            danger
            disabled={record.status !== "Pending"}
            onClick={async () => {
              try {
                await axios.put(
                  `https://restaurant-backend-kiran.up.railway.app/api/vendor-orders/${record.id}/status`,
                  { status: "Cancelled", amount: record.amount }
                );
                toast.info(`Order for ${record.item_name} cancelled.`);
                fetchOrders(); // Fetch latest stock and orders
              } catch {
                toast.error("Error cancelling order");
              }
            }}
          >
            Cancel
          </Button>
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
        <h3>Vendor Orders</h3>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Order
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Add Order Modal */}
      <Modal
        title="Place New Order"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrder}>
          <Form.Item
            name="item"
            label="Select Item"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select Item"
              showSearch
              optionFilterProp="children"
            >
              {items.map((i) => (
                <Option key={i.item_id} value={i.item_id}>
                  {i.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Stock Quantity"
            rules={[{ required: true, message: "Enter quantity" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="vendor"
            label="Select Vendor"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Vendor">
              {vendors.map((v) => (
                <Option key={v.id} value={v.vendor_name}>
                  {v.vendor_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Place Order
          </Button>
        </Form>
      </Modal>

      {/* Mark Delivered Modal */}
      <Modal
        title="Mark Delivered / Edit Order"
        open={amountModalVisible}
        onCancel={() => {
          setAmountModalVisible(false);
          setCurrentOrder(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await axios.put(
                `https://restaurant-backend-kiran.up.railway.app/api/vendor-orders/${currentOrder.id}/status`,
                {
                  status: "Delivered",
                  vendor: values.vendor,
                  quantity: values.quantity,
                  amount: values.amount,
                }
              );

              toast.success(
                `Order for ${currentOrder.item_name} updated and delivered.`
              );
              setAmountModalVisible(false);
              setCurrentOrder(null);
              form.resetFields();
              fetchOrders(); // fetch updated stock
            } catch (err) {
              toast.error("Error updating order");
              console.error(err);
            }
          }}
        >
          <Form.Item label="Item">
            <Input value={currentOrder?.item_name} disabled />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Stock Quantity"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="vendor"
            label="Select Vendor"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Vendor">
              {vendors.map((v) => (
                <Option key={v.id} value={v.vendor_name}>
                  {v.vendor_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Mark Delivered
          </Button>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default OrderItemsPage;
