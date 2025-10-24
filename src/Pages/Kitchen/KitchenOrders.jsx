// import React, { useEffect, useState } from "react";
// import { Table, Tag, Button, Space } from "antd";
// import { useSelector, useDispatch } from "react-redux";
// import { updateOrderStatus } from "../../Redux/Slices/orderSlice";

// const KitchenOrders = () => {
//   const dispatch = useDispatch();
//   const orders = useSelector((state) => state.orders.orders);

//   const [elapsedTimes, setElapsedTimes] = useState({});

//   // Update timers every second for Cooking orders
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const newElapsed = {};
//       orders.forEach((order) => {
//         if (order.status === "Cooking" && order.startedAt) {
//           const diffMs = new Date() - new Date(order.startedAt);
//           const minutes = Math.floor(diffMs / 60000);
//           const seconds = Math.floor((diffMs % 60000) / 1000);
//           newElapsed[order.id] = `${minutes}m ${seconds}s`;
//         } else if (
//           order.status === "Completed" &&
//           order.startedAt &&
//           order.completedAt
//         ) {
//           const diffMs =
//             new Date(order.completedAt) - new Date(order.startedAt);
//           const minutes = Math.floor(diffMs / 60000);
//           const seconds = Math.floor((diffMs % 60000) / 1000);
//           newElapsed[order.id] = `${minutes}m ${seconds}s`;
//         }
//       });
//       setElapsedTimes(newElapsed);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [orders]);

//   const handleStatusUpdate = (order) => {
//     let newStatus;
//     if (order.status === "Started Preparing") newStatus = "Cooking";
//     else if (order.status === "Cooking") newStatus = "Ready";
//     else if (order.status === "Ready") newStatus = "Completed";

//     const startedAt =
//       order.status === "Started Preparing"
//         ? new Date().toISOString()
//         : order.startedAt;
//     const completedAt =
//       newStatus === "Completed" ? new Date().toISOString() : order.completedAt;

//     dispatch(
//       updateOrderStatus({
//         id: order.id,
//         status: newStatus,
//         startedAt,
//         completedAt,
//       })
//     );
//   };

//   const columns = [
//     { title: "Table", dataIndex: "table_number", key: "table_number" },
//     {
//       title: "Items",
//       dataIndex: "items",
//       key: "items",
//       render: (items) =>
//         Array.isArray(items)
//           ? items.join(", ")
//           : JSON.parse(items || "[]").join(", "),
//     },
//     { title: "Staff", dataIndex: "staff_name", key: "staff_name" },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (status) => {
//         const color =
//           status === "Started Preparing"
//             ? "blue"
//             : status === "Cooking"
//             ? "orange"
//             : status === "Ready"
//             ? "purple"
//             : "green";
//         return <Tag color={color}>{status}</Tag>;
//       },
//     },
//     {
//       title: "Elapsed / Total Time",
//       key: "elapsed",
//       render: (_, record) => (
//         <Tag color={record.status === "Completed" ? "green" : "blue"}>
//           {elapsedTimes[record.id] || "0m 0s"}
//         </Tag>
//       ),
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <Space>
//           {record.status === "Started Preparing" && (
//             <Button type="primary" onClick={() => handleStatusUpdate(record)}>
//               Start Cooking
//             </Button>
//           )}
//           {record.status === "Cooking" && (
//             <Button type="default" onClick={() => handleStatusUpdate(record)}>
//               Mark Ready
//             </Button>
//           )}
//           {record.status === "Ready" && (
//             <Button type="dashed" onClick={() => handleStatusUpdate(record)}>
//               Complete
//             </Button>
//           )}
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <Table
//       columns={columns}
//       dataSource={orders}
//       rowKey="id"
//       pagination={false}
//       bordered
//     />
//   );
// };

// export default KitchenOrders;
