import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Input,
  Select,
  Table,
  Tag,
  Button,
  Space,
  Drawer,
} from "antd";
import {
  OrderedListOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrders, updateOrderStatus } from "../../Redux/Slices/orderSlice";
import { fetchStock, useIngredients } from "../../Redux/Slices/stockSlice";
import { logout } from "../../Redux/Slices/authSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ManageStock from "./ManageStock";

const { Sider, Content, Header } = Layout;
const { Search } = Input;

const KitchenDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector((state) => state.orders.orders || []);
  const stockItems = useSelector((state) => state.stock.stockItems || []);
  const lowStockAlerts = useSelector(
    (state) => state.stock.lowStockAlerts || []
  );
  const staffList = useSelector((state) => state.staff.staffList || []);

  const [selectedMenu, setSelectedMenu] = useState("orders");
  const [statusFilter, setStatusFilter] = useState(null);
  const [staffFilter, setStaffFilter] = useState("");
  const [tableFilter, setTableFilter] = useState(null);
  const [elapsedTimes, setElapsedTimes] = useState({});

  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch orders & stock periodically
  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchStock());
    const interval = setInterval(() => {
      dispatch(fetchOrders());
      dispatch(fetchStock());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Track cooking durations
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

  const handleStatusUpdate = async (order) => {
    let newStatus;

    if (order.status === "Pending" || order.status === "Started Preparing") {
      newStatus = "Cooking";
      try {
        const orderItems = Array.isArray(order.items)
          ? order.items
          : JSON.parse(order.items || "[]");

        await axios.post(
          "https://restaurant-backend-kiran.up.railway.app/api/stock/reduce",
          { items: orderItems }
        );
        dispatch(useIngredients({ ingredients: orderItems }));
        toast.success("Stock reduced for cooking order");
      } catch (err) {
        console.error("Error reducing stock:", err);
        toast.error("Failed to reduce stock");
      }
    } else if (order.status === "Cooking") newStatus = "Ready";
    else if (order.status === "Ready") newStatus = "Completed";

    const startedAt =
      order.status === "Pending" || order.status === "Started Preparing"
        ? new Date().toISOString()
        : order.startedAt;
    const completedAt =
      newStatus === "Completed" ? new Date().toISOString() : order.completedAt;

    dispatch(
      updateOrderStatus({
        id: order.id,
        status: newStatus,
        startedAt,
        completedAt,
      })
    );

    try {
      await axios.patch(
        `https://restaurant-backend-kiran.up.railway.app/api/orders/${order.id}/status`,
        { status: newStatus, staff_id: order.staff_id || null }
      );
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const orderColumns = [
    {
      title: "Table",
      key: "table",
      render: (order) =>
        order.table || order.tableNo || order.table_number || "N/A",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items) => {
        let arr = [];
        try {
          arr = typeof items === "string" ? JSON.parse(items) : items;
        } catch {
          arr = [];
        }
        return arr
          .map((i) => (typeof i === "string" ? i : `${i.name} x${i.quantity}`))
          .join(", ");
      },
    },
    {
      title: "Staff",
      key: "staff",
      render: (order) => order.staff_name || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Pending"
            ? "orange"
            : status === "Cooking"
            ? "blue"
            : status === "Ready"
            ? "green"
            : "gray";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Elapsed / Total Time",
      key: "elapsed",
      render: (_, record) => (
        <Tag color={record.status === "Completed" ? "green" : "blue"}>
          {elapsedTimes[record.id] || "0m 0s"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          {(record.status === "Pending" ||
            record.status === "Started Preparing") && (
            <Button
              type="primary"
              size={isMobile ? "small" : "middle"}
              onClick={() => handleStatusUpdate(record)}
            >
              Start Cooking
            </Button>
          )}
          {record.status === "Cooking" && (
            <Button
              type="default"
              size={isMobile ? "small" : "middle"}
              onClick={() => handleStatusUpdate(record)}
            >
              Mark Ready
            </Button>
          )}
          {record.status === "Ready" && (
            <Button
              type="dashed"
              size={isMobile ? "small" : "middle"}
              onClick={() => handleStatusUpdate(record)}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter((o) => {
    const staffName = o.staff_name || "";
    return (
      (statusFilter ? o.status === statusFilter : true) &&
      (staffFilter
        ? staffName.toLowerCase().includes(staffFilter.toLowerCase())
        : true) &&
      (tableFilter
        ? (o.table || o.tableNo || o.table_number) === tableFilter
        : true)
    );
  });

  const totalOrders = orders.length;
  const cookingOrders = orders.filter((o) => o.status === "Cooking").length;
  const readyOrders = orders.filter((o) => o.status === "Ready").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;

  const renderContent = () => {
    if (selectedMenu === "orders") {
      return (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={6}>
              <Card>Total Orders: {totalOrders}</Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card>Cooking: {cookingOrders}</Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card>Ready: {readyOrders}</Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card>Completed: {completedOrders}</Card>
            </Col>
          </Row>
          <br></br>
          <Row gutter={[8, 8]} wrap style={{ marginBottom: 20 }}>
            <Col>
              <Select
                placeholder="Filter by status"
                style={{ width: isMobile ? 120 : 150 }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Select.Option value="Started Preparing">
                  Start Cooking
                </Select.Option>
                <Select.Option value="Cooking">Mark Ready</Select.Option>
                <Select.Option value="Ready">Ready</Select.Option>
                <Select.Option value="Completed">Completed</Select.Option>
              </Select>
            </Col>
            <Col>
              <Search
                placeholder="Filter by Staff"
                style={{ width: isMobile ? 150 : 250 }}
                allowClear
                onChange={(e) => setStaffFilter(e.target.value)}
              />
            </Col>
            <Col>
              <Select
                placeholder="Filter by Table"
                style={{ width: isMobile ? 120 : 150 }}
                value={tableFilter}
                onChange={setTableFilter}
                allowClear
              >
                {[
                  ...new Set(
                    orders.map((o) => o.table || o.tableNo || o.table_number)
                  ),
                ].map((table) => (
                  <Select.Option key={table} value={table}>
                    {table}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Table
            columns={orderColumns}
            dataSource={filteredOrders}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </>
      );
    }

    if (selectedMenu === "stock") return <ManageStock />;
  };

  const menuContent = (
    <Menu
      mode="inline"
      selectedKeys={[selectedMenu]}
      onClick={(e) => {
        setSelectedMenu(e.key);
        if (isMobile) setDrawerVisible(false);
      }}
      items={[
        { key: "orders", icon: <OrderedListOutlined />, label: "Orders" },
        { key: "stock", icon: <DatabaseOutlined />, label: "Stock Monitor" },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          theme="light"
          width={220}
          style={{
            borderRight: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                padding: "16px",
                fontWeight: "bold",
                textAlign: "center",
                borderBottom: "1px solid #eee",
              }}
            >
              Kitchen Panel
            </div>
            {menuContent}
          </div>
          <div style={{ padding: "16px", borderTop: "1px solid #eee" }}>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              block
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Sider>
      )}

      <Layout>
        {/* Mobile Header */}
        {isMobile && (
          <Header
            style={{
              background: "#fff",
              padding: "0 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #eee",
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />
            <div style={{ fontWeight: "bold" }}>Kitchen Panel</div>
            <Button
              type="primary"
              danger
              size="small"
              onClick={handleLogout}
              icon={<LogoutOutlined />}
            />
          </Header>
        )}

        {/* Drawer for mobile menu */}
        <Drawer
          title="Kitchen Panel"
          placement="left"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          {menuContent}
        </Drawer>

        <Content
          style={{ padding: 16, background: "#fff", minHeight: "100vh" }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default KitchenDashboard;
