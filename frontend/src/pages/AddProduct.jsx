import React, { useState } from "react";
import axios from "axios";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    image: "",
    description: "",
    rentPerMonth: "",
    deposit: "",
    tenureOptions: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Please login as Admin first ❌");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        image: formData.image,
        description: formData.description,
        rentPerMonth: Number(formData.rentPerMonth),
        deposit: Number(formData.deposit),
        tenureOptions: formData.tenureOptions
          ? formData.tenureOptions
              .split(",")
              .map((t) => Number(t.trim()))
          : []
      };

      console.log("Sending Payload:", payload);

      const response = await axios.post(
        "https://rentease-backend-oxyy.onrender.com/api/products",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Server Response:", response.data);

      alert("Product Added Successfully ✅");

      setFormData({
        name: "",
        category: "",
        image: "",
        description: "",
        rentPerMonth: "",
        deposit: "",
        tenureOptions: ""
      });

    } catch (err) {
      console.error("FULL ERROR:", err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
        "Failed to add product ❌"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-3xl">
        <h1 className="text-3xl font-semibold mb-8 text-slate-800">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product Name"
            required
            className="col-span-1 h-12 px-4 border rounded-lg"
          />

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            required
            className="col-span-1 h-12 px-4 border rounded-lg"
          />

          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Image URL"
            required
            className="col-span-2 h-12 px-4 border rounded-lg"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
            rows="3"
            className="col-span-2 px-4 py-3 border rounded-lg"
          />

          <input
            type="number"
            name="rentPerMonth"
            value={formData.rentPerMonth}
            onChange={handleChange}
            placeholder="Rent Per Month"
            required
            className="h-12 px-4 border rounded-lg"
          />

          <input
            type="number"
            name="deposit"
            value={formData.deposit}
            onChange={handleChange}
            placeholder="Security Deposit"
            required
            className="h-12 px-4 border rounded-lg"
          />

          <input
            type="text"
            name="tenureOptions"
            value={formData.tenureOptions}
            onChange={handleChange}
            placeholder="Tenure Options (3,6,12)"
            required
            className="col-span-2 h-12 px-4 border rounded-lg"
          />

          <div className="col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-all"
            >
              Add Product
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;
