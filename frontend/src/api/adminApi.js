import axios from "axios";

const API = axios.create({
  baseURL: "https://rentease-backend-oxyy.onrender.com/api",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = sessionStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ================= ADMIN APIs =================

// Get all maintenance requests
export const getMaintenanceRequests = () =>
  API.get("/admin/maintenance");

// Update status
export const updateMaintenance = (id, data) =>
  API.put(`/admin/maintenance/${id}`, data);

// Delete request
export const deleteMaintenance = (id) =>
  API.delete(`/admin/maintenance/${id}`);