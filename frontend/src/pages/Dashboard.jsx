import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dashboard() {
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    api.get("/rentals/demoUserId")
      .then(res => setRentals(res.data));
  }, []);

  return (
    <div className="container">
      <h2>My Rentals</h2>
      {rentals.map(r => (
        <div className="card" key={r._id}>
          <p>Product ID: {r.productId}</p>
          <p>Tenure: {r.tenure} Months</p>
          <p>Status: {r.status}</p>
        </div>
      ))}
    </div>
  );
}