import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../api/axiosInstance";

const API_ROOT = "http://localhost:4500";

export default function AddAssignment() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    property_id: "",
    client_id: "",
    assigned_by: localStorage.getItem("admin_id") || "",
    amount: "",
    details: "",
    assigned_at: "",
  });
  const [error, setError] = useState("");

  // ✅ Load clients + available properties
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, propRes] = await Promise.all([
          api.get(`${API_ROOT}/admin/clients`),
          axios.get(`${API_ROOT}/getproperties`),
        ]);

        setUsers(userRes.data || []);

        // Only show available properties
        const available = (propRes.data || []).filter(
          (p) => (p.status || "").toLowerCase() === "available"
        );
        setProperties(available);
      } catch (err) {
        console.error("Data load error:", err);
        setError("Failed to load clients or properties.");
      }
    };

    loadData();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.property_id || !form.client_id || !form.assigned_by) {
      setError("Property, client, and assigned_by are required");
      return;
    }

    try {
      await axios.post(`${API_ROOT}/addassignedproperty`, {
        property_id: form.property_id,
        client_id: Number(form.client_id),
        assigned_by: Number(form.assigned_by),
        amount: form.amount || null,
        details: form.details || null,
        assigned_at: form.assigned_at || new Date().toISOString(),
      });

      alert("Property assigned successfully ✔");
      navigate("/admin/propertyassigned");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to assign property");
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        <Breadcrumb
          title="Assignments"
          breadcrumbText="Create Assignment"
          button={{ link: "/admin/propertyassigned", text: "View Assignments" }}
        />

        <div className="admin-dashboard-main-header" style={{ marginBottom: 24 }}>
          <div>
            <h5>Create Assignment</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">
                Dashboard
              </Link>
              <IoMdArrowDropright />
              <Link to="/admin/propertyassigned" className="breadcrumb-link active">
                Assignments
              </Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Create</span>
            </div>
          </div>

          <div className="admin-panel-header-add-buttons">
            <NavLink
              to="/admin/propertyassigned"
              className="cancel-btn dashboard-add-product-btn"
            >
              <HiXMark /> Cancel
            </NavLink>
            <button
              onClick={handleSubmit}
              className="primary-btn dashboard-add-product-btn"
            >
              <MdSave /> Assign
            </button>
          </div>
        </div>

        <div className="dashboard-add-content-card-div" style={{ paddingBottom: 40 }}>
          <div className="dashboard-add-content-card" style={{ maxWidth: 700 }}>
            <h6>Assignment Details</h6>

            {error && (
              <div style={{ color: "crimson", marginBottom: 10, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <form className="add-product-form-container" onSubmit={handleSubmit}>
              <label>Client</label>
              <select
                name="client_id"
                value={form.client_id}
                onChange={handleChange}
                required
              >
                <option value="">-- select client --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email || u.number})
                  </option>
                ))}
              </select>

              <label style={{ marginTop: 10 }}>Property</label>
              <select
                name="property_id"
                value={form.property_id}
                onChange={handleChange}
                required
              >
                <option value="">-- select property --</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — ₹{p.price}
                  </option>
                ))}
              </select>

              <label style={{ marginTop: 10 }}>Amount</label>
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="e.g. 8500000"
              />

              <label style={{ marginTop: 10 }}>Details</label>
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
                rows={3}
              />

              <label style={{ marginTop: 10 }}>Assigned At</label>
              <input
                type="datetime-local"
                name="assigned_at"
                value={form.assigned_at}
                onChange={handleChange}
              />
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
