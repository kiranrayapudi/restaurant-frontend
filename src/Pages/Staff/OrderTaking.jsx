import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Tag,
  Space,
  Spin,
  Input,
  message,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { setMenu } from "../../Redux/Slices/menuSlice";
import { fetchStaff } from "../../Redux/Slices/staffSlice";

const OrderTaking = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [form] = Form.useForm();
  const [addItemsForm] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItemsOptions, setMenuItemsOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookedTables, setBookedTables] = useState([]);

  const dispatch = useDispatch();
  const menuItems = useSelector((state) => state.menu.items);
  const staffList = useSelector((state) => state.staff.list);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/orders"
      );
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch menu
  const fetchMenu = async () => {
    try {
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/menu"
      );
      dispatch(setMenu(res.data.menu));
      setMenuItemsOptions(
        res.data.menu.map((m) => ({ label: m.name, value: m.name }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch booked tables
  const fetchBookedTables = async () => {
    try {
      const res = await axios.get(
        "https://restaurant-backend-kiran.up.railway.app/api/bookings/tables-with-booking"
      );
      setBookedTables(res.data.tables || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookedTables();
  }, []);

  useEffect(() => {
    dispatch(fetchStaff());
    fetchOrders();
    fetchMenu();
  }, [dispatch]);

  // Build table dropdown options including reserved info
  useEffect(() => {
    const getTablesForDropdown = async () => {
      try {
        const res = await axios.get(
          "https://restaurant-backend-kiran.up.railway.app/api/tables"
        );
        const allTables = res.data.tables;

        // Map booked tables for quick lookup
        const bookedMap = {};
        bookedTables.forEach((b) => {
          if (b.status === "booked" || b.status === "reserved") {
            bookedMap[b.id] = b;
          }
        });

        // Only keep booked/reserved tables for dropdown
        const bookedTableOptions = allTables
          .filter((t) => bookedMap[t.id])
          .map((t) => ({
            label: `${t.table_number} (${
              bookedMap[t.id].customer_name || "Reserved"
            })`,
            value: t.id,
            customer_name: bookedMap[t.id].customer_name,
            isReserved: true,
          }));

        setTables(bookedTableOptions);
      } catch (err) {
        console.error("Failed to fetch tables:", err);
      }
    };

    getTablesForDropdown();
  }, [bookedTables]);

  // Reduce stock
  const reduceStock = async (menuName, quantity) => {
    try {
      const menuItem = menuItems.find((m) => m.name === menuName);
      if (!menuItem) return;
      await axios.patch(
        `https://restaurant-backend-kiran.up.railway.app/api/menu/${menuItem.id}/reduce-stock`,
        { quantity }
      );
    } catch (err) {
      console.error(`Failed to reduce stock for ${menuName}`, err);
    }
  };

  // Add new order
  const handleAddOrder = async (values) => {
    try {
      for (let item of values.items) {
        const menuItem = menuItems.find((m) => m.name === item.name);
        if (!menuItem) {
          toast.error(`Menu item ${item.name} not found`);
          return;
        }
        if (item.quantity > menuItem.stock) {
          message.error(
            `Cannot order ${item.quantity} of ${menuItem.name}. Only ${menuItem.stock} in stock.`
          );
          return;
        }
      }

      await axios.post(
        "https://restaurant-backend-kiran.up.railway.app/api/orders",
        {
          table_id: values.table,
          customer_name: values.customer_name,
          items: values.items,
          staff_id: values.staff_id || null,
        }
      );

      for (let item of values.items) {
        await reduceStock(item.name, item.quantity);
      }

      toast.success("Order added successfully!");
      setIsModalOpen(false);
      form.resetFields();
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add order");
    }
  };

  // Add items to existing order
  const openAddItemsModal = (order) => {
    setCurrentOrder(order);
    setIsAddItemsModalOpen(true);
    addItemsForm.resetFields();
    addItemsForm.setFieldsValue({ items: [{ name: "", quantity: 1 }] });
  };

  const handleAddItems = async (values) => {
    try {
      for (let item of values.items) {
        const menuItem = menuItems.find((m) => m.name === item.name);
        if (!menuItem) {
          toast.error(`Menu item ${item.name} not found`);
          return;
        }
        if (item.quantity > menuItem.stock) {
          message.error(
            `Cannot add ${item.quantity} of ${menuItem.name}. Only ${menuItem.stock} in stock.`
          );
          return;
        }
      }

      await axios.patch(
        `https://restaurant-backend-kiran.up.railway.app/api/orders/${currentOrder.id}/add-items`,
        { items: values.items }
      );

      for (let item of values.items) {
        await reduceStock(item.name, item.quantity);
      }

      toast.success("Items added successfully!");
      setIsAddItemsModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add items");
    }
  };

  // Generate bill
  const handleGenerateBill = async (order) => {
    try {
      const res = await axios.get(
        `https://restaurant-backend-kiran.up.railway.app/api/orders/${order.id}/bill`
      );
      const bill = res.data;

      Modal.info({
        title: `Bill for Order #${bill.order_id}`,
        content: (
          <div>
            <p>
              <strong>Table:</strong> {bill.table_number}
            </p>
            <p>
              <strong>Staff:</strong> {bill.staff_name || "No Staff Assigned"}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(bill.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Items:</strong>
            </p>
            <ul>
              {bill.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} x {item.quantity} @ ₹{item.price} = ₹
                  {item.subtotal}
                </li>
              ))}
            </ul>
            <p>
              <strong>Total: ₹{bill.total}</strong>
            </p>
          </div>
        ),
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate bill");
    }
  };

  const columns = [
    { title: "Table", dataIndex: "table_number", key: "table_number" },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items) => {
        let parsedItems = [];
        try {
          parsedItems = typeof items === "string" ? JSON.parse(items) : items;
        } catch {
          parsedItems = [];
        }
        return parsedItems
          .map((i) => `${i.name} x${i.quantity || 1}`)
          .join(", ");
      },
    },
    {
      title: "Staff",
      dataIndex: "staff_name",
      key: "staff_name",
      render: (text) => text || "No Staff Assigned",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Started Preparing"
            ? "blue"
            : status === "Cooking"
            ? "orange"
            : status === "Ready"
            ? "purple"
            : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="dashed" onClick={() => handleGenerateBill(record)}>
            Generate Bill
          </Button>
          <Button type="primary" onClick={() => openAddItemsModal(record)}>
            Add Items
          </Button>
        </Space>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (text) => text || "N/A",
    },
  ];

  if (loading)
    return (
      <Spin
        size="large"
        style={{ marginTop: 100, display: "block", textAlign: "center" }}
      />
    );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>🧾 Order Management</h2>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          + Add Order
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        bordered
      />

      {/* Add New Order Modal */}
      <Modal
        title="Add New Order"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrder}>
          <Form.Item
            name="table"
            label="Select Reserved Table"
            rules={[
              { required: true, message: "Please select a reserved table" },
            ]}
          >
            {tables.length > 0 ? (
              <Select
                placeholder="Select reserved table"
                options={tables.map((t) => ({
                  label: t.label,
                  value: t.value,
                }))}
                onChange={(tableId) => {
                  const selected = tables.find((t) => t.value === tableId);
                  form.setFieldsValue({
                    customer_name: selected?.customer_name || "",
                  });
                }}
              />
            ) : (
              <Tag color="red">No reserved tables available</Tag>
            )}
          </Form.Item>

          <Form.Item
            name="customer_name"
            label="Customer Name"
            rules={[{ required: true, message: "Enter customer name" }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>

          <Form.List name="items" initialValue={[{ name: "", quantity: 1 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    align="baseline"
                    style={{ display: "flex", marginBottom: 8 }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[{ required: true, message: "Select item" }]}
                    >
                      <Select
                        placeholder="Select dish"
                        options={menuItemsOptions}
                        style={{ minWidth: 200 }}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: "Enter quantity" }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        style={{ width: 80 }}
                      />
                    </Form.Item>

                    <Button type="link" onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  + Add Another Item
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item name="staff_id" label="Assign Staff">
            <Select
              showSearch
              placeholder="Select staff"
              options={staffList.map((s) => ({
                label: `${s.name} (${s.role})`,
                value: s.id,
              }))}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Save Order
          </Button>
        </Form>
      </Modal>

      {/* Add Items Modal */}
      <Modal
        title={`Add Items to Table ${currentOrder?.table_number}`}
        open={isAddItemsModalOpen}
        onCancel={() => setIsAddItemsModalOpen(false)}
        footer={null}
      >
        <Form form={addItemsForm} layout="vertical" onFinish={handleAddItems}>
          <Form.List name="items" initialValue={[{ name: "", quantity: 1 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    align="baseline"
                    style={{ display: "flex", marginBottom: 8 }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[{ required: true, message: "Select item" }]}
                    >
                      <Select
                        placeholder="Select dish"
                        options={menuItemsOptions}
                        style={{ minWidth: 200 }}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: "Enter quantity" }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        style={{ width: 80 }}
                      />
                    </Form.Item>

                    <Button type="link" onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  + Add Another Item
                </Button>
              </>
            )}
          </Form.List>
          <Button type="primary" htmlType="submit" block>
            Add Items
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default OrderTaking;
