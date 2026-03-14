import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminAddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitProduct = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        alert("Please login as Admin first ❌");
        return;
      }

      // Basic validation
      if (!form.name || !form.price || !form.category) {
        alert("Please fill all required fields ❌");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/products",
        {
          name: form.name,
          category: form.category,
          image: form.image,
          description: form.description,
          rentPerMonth: Number(form.price),
          deposit: 0,
          tenureOptions: [3, 6, 12]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Created:", response.data);

      alert("Product Added Successfully ✅");

      // Reset form
      setForm({
        name: "",
        price: "",
        description: "",
        image: "",
        category: ""
      });

      navigate("/products");

    } catch (error) {
      console.error("ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to add product ❌");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-100">
      <form
        onSubmit={submitProduct}
        className="bg-white p-8 shadow-lg w-96 space-y-4 rounded"
      >
        <h2 className="text-xl font-semibold text-center">
          Add Product
        </h2>

        <input
          name="name"
          value={form.name}
          placeholder="Product Name"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="price"
          type="number"
          value={form.price}
          placeholder="Rent Per Month"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="image"
          value={form.image}
          placeholder="Image URL"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="category"
          value={form.category}
          placeholder="Category"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <textarea
          name="description"
          value={form.description}
          placeholder="Description"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-slate-800 text-white py-2 rounded"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AdminAddProduct;
