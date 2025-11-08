import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

const API_ROOT = "http://localhost:4500";

export default function AddPayment() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    client_id: "",
    property_id: "",
    amount: "",
    payment_method: "",
    paid_at: "",
    notes: "",
  });
  const [error, setError] = useState("");

  // ✅ Fetch clients
  const fetchClients = async () => {
    try {
      const res = await api.get(`${API_ROOT}/admin/clients`);
      setClients(res.data || []);
    } catch (err) {
      console.error("fetchClients error:", err);
      setError("Failed to fetch clients");
    }
  };

  // ✅ Fetch properties
  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/getproperties`);
      setProperties(res.data || []);
    } catch (err) {
      console.error("fetchProperties error:", err);
      setError("Failed to fetch properties");
    }
  };

  // ✅ Fetch assigned properties
  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/getassignedproperties`);
      setAssignments(res.data || []);
    } catch (err) {
      console.error("fetchAssignments error:", err);
      setError("Failed to fetch assignments");
    }
  };

  // 🧠 mount → fetch everything independently
  useEffect(() => {
    fetchClients();
    fetchProperties();
    fetchAssignments();
  }, []);

  // 🧩 filter properties for selected client
  const filteredProperties = assignments
    .filter((a) => String(a.client_id) === form.client_id)
    .map((a) => properties.find((p) => String(p.id) === String(a.property_id)))
    .filter(Boolean);

  // 🖊️ handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // 💾 submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.client_id || !form.property_id || !form.amount) {
      setError("Please fill all required fields");
      return;
    }

    try {
      await axios.post(`${API_ROOT}/addpayment`, {
        client_id: form.client_id,
        property_id: form.property_id,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        paid_at: form.paid_at || new Date().toISOString(),
        notes: form.notes || null,
        status: "paid",
      });

      alert("Payment added successfully ✅");
      navigate("/admin/payments");
    } catch (err) {
      console.error("addPayment error:", err);
      setError("Failed to add payment ❌");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 520 }}>
      <h3>Add Payment</h3>
      {error && <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Client */}
        <label>Client</label>
        <select name="client_id" value={form.client_id} onChange={handleChange}>
          <option value="">-- select client --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Property */}
        <label>Property</label>
        <select
          name="property_id"
          value={form.property_id}
          onChange={handleChange}
          disabled={!form.client_id}
        >
          <option value="">
            {form.client_id ? "-- select property --" : "-- select client first --"}
          </option>
          {filteredProperties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — ₹{p.price}
            </option>
          ))}
        </select>

        {/* Amount */}
        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Enter amount"
        />

        {/* Payment Method */}
        <label>Payment Method</label>
        <select
          name="payment_method"
          value={form.payment_method}
          onChange={handleChange}
        >
          <option value="">-- select --</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="card">Card</option>
        </select>

        {/* Paid At */}
        <label>Paid At</label>
        <input
          type="datetime-local"
          name="paid_at"
          value={form.paid_at}
          onChange={handleChange}
        />

        {/* Notes */}
        <label>Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Optional notes..."
        />

        <button type="submit" style={{ marginTop: 10 }}>
          Save Payment
        </button>
      </form>
    </div>
  );
}
