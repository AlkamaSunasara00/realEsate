// src/pages/admin/payments/AddPayment.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

const API_ROOT = "http://localhost:4500";

const AddPayment = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]); // all properties
  const [assignments, setAssignments] = useState([]); // assigned_properties rows
  const [filteredProperties, setFilteredProperties] = useState([]); // properties for selected client
  const [form, setForm] = useState({
    property_id: "",
    client_id: "",
    amount: "",
    payment_method: "",
    status: "pending",
    notes: "",
    paid_at: "",
  });
  const [error, setError] = useState("");

  // Fetch clients
  const fetchClients = async () => {
    try {
      const res = await api.get(`${API_ROOT}/admin/clients`);
      setClients(res.data || []);
    } catch (err) {
      console.error("fetchClients", err);
    }
  };

  // Fetch properties
  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/getproperties`);
      setProperties(res.data || []);
    } catch (err) {
      console.error("fetchProperties", err);
    }
  };

  // Fetch assigned properties
  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/getassignedproperties`);
      setAssignments(res.data || []);
    } catch (err) {
      console.error("fetchAssignments", err);
    }
  };

  useEffect(() => {
    const adminId = localStorage.getItem("admin_id");
    if (adminId) {
      setForm((f) => ({
        ...f,
        notes: f.notes ? f.notes : `Recorded by admin:${adminId}`,
      }));
    }
    (async () => {
      await Promise.all([fetchClients(), fetchProperties(), fetchAssignments()]);
    })();
  }, []);

  // when client changes, filter only that client's assigned properties
  useEffect(() => {
    if (!form.client_id) {
      setFilteredProperties([]);
      setForm((prev) => ({ ...prev, property_id: "" }));
      return;
    }

    const assignedPropertyIds = assignments
      .filter((a) => String(a.client_id) === String(form.client_id))
      .map((a) => String(a.property_id));

    const propsForClient = properties.filter((p) =>
      assignedPropertyIds.includes(String(p.id))
    );
    setFilteredProperties(propsForClient);

    if (
      form.property_id &&
      !assignedPropertyIds.includes(String(form.property_id))
    ) {
      setForm((prev) => ({ ...prev, property_id: "" }));
    }
  }, [form.client_id, assignments, properties]);

  // handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // build payload
  const payloadFromForm = () => ({
    property_id: form.property_id,
    client_id: form.client_id || null,
    amount: Number(form.amount),
    payment_method: form.payment_method || null, // goes to DB
    status: form.status || "completed",
    notes: form.notes || null,
    paid_at: form.paid_at ? form.paid_at.replace("T", " ") : null,
  });

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.property_id || !form.amount) {
      setError("Property and amount are required");
      return;
    }
    try {
      await axios.post(`${API_ROOT}/addpayment`, payloadFromForm());
      alert("Payment recorded ✅");
      navigate("/admin/payments");
    } catch (err) {
      console.error("add payment", err);
      setError("Failed to add payment ❌");
    }
  };

  return (
    <div style={{ padding: 18 }}>
      <h3>Add Payment</h3>
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 8, maxWidth: 520 }}
      >
        {/* Select client */}
        <label>Client</label>
        <select name="client_id" value={form.client_id} onChange={handleChange}>
          <option value="">-- select client --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Select property (only assigned) */}
        <label>Property</label>
        <select
          name="property_id"
          value={form.property_id}
          onChange={handleChange}
          required
        >
          <option value="">
            {form.client_id
              ? "-- select property assigned to this client --"
              : "-- select client first --"}
          </option>
          {filteredProperties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title || p.id} — ₹{p.price}
            </option>
          ))}
        </select>

        {/* Amount */}
        <label>Amount</label>
        <input
          name="amount"
          value={form.amount}
          onChange={handleChange}
          type="number"
          step="0.01"
          required
        />

        {/* Payment Method Dropdown */}
        <label>Payment Method</label>
        <select
          name="payment_method"
          value={form.payment_method}
          onChange={handleChange}
          required
        >
          <option value="">-- select payment method --</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </select>

        {/* Paid at */}
        <label>Paid At</label>
        <input
          name="paid_at"
          type="datetime-local"
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
        />

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Save Payment</button>
          <button
            type="button"
            onClick={() =>
              setForm({
                property_id: "",
                client_id: "",
                amount: "",
                payment_method: "",
                status: "pending",
                notes: "",
                paid_at: "",
              })
            }
          >
            Clear
          </button>
        </div>
      </form>

      {/* Debug info */}
      <div style={{ marginTop: 20, opacity: 0.8, fontSize: 13 }}>
        <div>
          Assigned properties for selected client: {filteredProperties.length}
        </div>
      </div>
    </div>
  );
};

export default AddPayment;
