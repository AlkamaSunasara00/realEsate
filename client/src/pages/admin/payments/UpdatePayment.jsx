// src/pages/admin/payments/UpdatePayment.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

const API_ROOT = "http://localhost:4500";

const UpdatePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = location.state?.item || null; // pass payment item from list
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    id: "",
    property_id: "",
    client_id: "",
    amount: "",
    payment_method: "",
    status: "completed",
    notes: "",
    paid_at: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get(`${API_ROOT}/admin/clients`),
          api.get(`${API_ROOT}/getproperties`),
        ]);
        setClients(cRes.data || []);
        setProperties(pRes.data || []);
        if (initial) {
          setForm({
            id: initial.id,
            property_id: initial.property_id,
            client_id: String(initial.client_id || ""),
            amount: initial.amount || "",
            payment_method: initial.payment_method || "",
            status: initial.status || "completed",
            notes: initial.notes || "",
            paid_at: initial.paid_at ? String(initial.paid_at).replace(" ", "T").slice(0, 16) : "",
          });
        }
      } catch (err) {
        console.error("init", err);
      }
    })();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.id) return setError("No payment loaded");
    try {
      await api.put(`${API_ROOT}/updatepayment/${form.id}`, {
        property_id: form.property_id || null,
        client_id: form.client_id || null,
        amount: Number(form.amount) || null,
        payment_method: form.payment_method || null,
        status: form.status || null,
        notes: form.notes || null,
        paid_at: form.paid_at ? form.paid_at.replace("T", " ") : null,
      });
      alert("Updated");
      navigate("/admin/payments"); // adjust route
    } catch (err) {
      console.error("update", err);
      setError("Update failed");
    }
  };

  return (
    <div style={{ padding: 18 }}>
      <h3>Update Payment</h3>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <form onSubmit={handleUpdate} style={{ maxWidth: 600, display: "grid", gap: 8 }}>
        <label>Client</label>
        <select name="client_id" value={form.client_id} onChange={handleChange}>
          <option value="">-- optional client --</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label>Property</label>
        <select name="property_id" value={form.property_id} onChange={handleChange}>
          <option value="">-- select property --</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.title || p.id}</option>)}
        </select>

        <label>Amount</label>
        <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} />

        <label>Payment method</label>
        <input name="payment_method" value={form.payment_method} onChange={handleChange} />

        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="completed">completed</option>
          <option value="pending">pending</option>
          <option value="rejected">rejected</option>
          <option value="refunded">refunded</option>
        </select>

        <label>Paid at</label>
        <input type="datetime-local" name="paid_at" value={form.paid_at} onChange={handleChange} />

        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} />

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Save changes</button>
          <button type="button" onClick={() => navigate("/admin/payments")}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePayment;
