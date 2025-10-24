// import React, { useState } from "react";
// import { QrReader } from "react-qr-reader";

// const QRScanner = () => {
//   const [data, setData] = useState("No result");

//   return (
//     <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
//       <h2>React QR Scanner</h2>

//       <QrReader
//         onResult={(result, error) => {
//           if (!!result) {
//             setData(result?.text);
//             console.log("QR Code Scanned:", result?.text);
//           }

//           if (!!error) {
//             console.warn(error);
//           }
//         }}
//         constraints={{ facingMode: "environment" }}
//         style={{ width: "100%" }}
//       />

//       <p>Scanned Result: {data}</p>
//     </div>
//   );
// };

// export default QRScanner;
