import React, { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, NavLink } from "react-router-dom";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { MdAdd } from "react-icons/md";

const API_ROOT = "http://localhost:4500";

const PaymentsHistory = () => {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterClient, setFilterClient] = useState("");
  const [filterProperty, setFilterProperty] = useState("");
  const navigate = useNavigate();

  // fetch clients
  const fetchClients = async () => {
    try {
      const res = await api.get(`${API_ROOT}/admin/clients`);
      setClients(res.data || []);
    } catch (err) {
      console.error("fetchClients", err);
    }
  };

  // fetch properties
  const fetchProperties = async () => {
    try {
      const res = await api.get(`${API_ROOT}/getproperties`);
      setProperties(res.data || []);
    } catch (err) {
      console.error("fetchProperties", err);
    }
  };

  // fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${API_ROOT}/getpayments`);
      setPayments(res.data || []);
    } catch (err) {
      console.error("fetchPayments", err);
      alert("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchClients(), fetchProperties(), fetchPayments()]);
    })();
  }, []);

  // delete payment
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      await api.delete(`${API_ROOT}/deletepayment/${id}`);
      await fetchPayments();
      alert("Deleted successfully ✅");
    } catch (err) {
      console.error("delete", err);
      alert("Delete failed ❌");
    }
  };

  // helpers
  const clientName = (id) =>
    clients.find((c) => String(c.id) === String(id))?.name || id;
  const propertyTitle = (id) =>
    properties.find((p) => String(p.id) === String(id))?.title || id;

  // filter results
  const filtered = payments.filter((p) => {
    if (filterClient && String(p.client_id) !== String(filterClient)) return false;
    if (filterProperty && String(p.property_id) !== String(filterProperty)) return false;
    return true;
  });

  return (
    <div style={{ padding: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h3 style={{ margin: 0 }}>Payments History</h3>

        {/* Add new payment button */}
        <NavLink
          to="/admin/addpayment"
          className="primary-btn"
          style={{
            display: "flex",
            alignItems: "center",
            background: "#007bff",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: "8px",
            textDecoration: "none",
            gap: 6,
          }}
        >
          <MdAdd size={18} /> Add Payment
        </NavLink>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
        >
          <option value="">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title || p.id}
            </option>
          ))}
        </select>

        <button onClick={fetchPayments}>Refresh</button>
        <button
          onClick={() => {
            setFilterClient("");
            setFilterProperty("");
          }}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table
          border={1}
          cellPadding={8}
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th>#</th>
              <th>Client</th>
              <th>Property</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Paid At</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", opacity: 0.6 }}>
                  No payments found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{clientName(p.client_id)}</td>
                  <td>{propertyTitle(p.property_id)}</td>
                  <td>₹{p.amount}</td>
                  <td>{p.payment_method || "-"}</td>
                  <td>{p.status}</td>
                  <td>{p.paid_at ? String(p.paid_at).slice(0, 19) : "-"}</td>
                  <td
                    style={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.notes || "-"}
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {/* Update page */}
                    <IoPencil
                      onClick={() =>
                        navigate("/admin/updatepayment", { state: { item: p } })
                      }
                      style={{
                        cursor: "pointer",
                        color: "#007bff",
                        fontSize: "18px",
                      }}
                    />

                    {/* Delete button */}
                    <MdDeleteForever
                      onClick={() => handleDelete(p.id)}
                      style={{
                        cursor: "pointer",
                        color: "crimson",
                        fontSize: "20px",
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentsHistory;
