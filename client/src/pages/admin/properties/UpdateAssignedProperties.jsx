import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import api from "../../../api/axiosInstance";

const API_ROOT = "http://localhost:4500";

export default function UpdateAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item || null;

  const [form, setForm] = useState({
    id: "",
    property_id: "",
    client_id: "",
    assigned_by: localStorage.getItem("admin_id") || "",
    amount: "",
    details: "",
    assigned_at: "",
  });
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [uRes, pRes, aRes] = await Promise.all([
          api.get(`${API_ROOT}/admin/clients`),
          axios.get(`${API_ROOT}/getproperties`),
          axios.get(`${API_ROOT}/getassignedproperties`),
        ]);
        setUsers(uRes.data || []);
        setProperties(pRes.data || []);
        setAssignments(aRes.data || []);
      } catch (err) {
        console.error("init fetch", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (item) {
      setForm({
        id: item.id,
        property_id: item.property_id,
        client_id: String(item.client_id),
        assigned_by: String(item.assigned_by),
        amount: item.amount || "",
        details: item.details || "",
        assigned_at: item.assigned_at ? String(item.assigned_at).replace(" ", "T").slice(0, 16) : "",
      });
    }
  }, [item]);

  // filter: properties that are available and not assigned (but keep current)
  const assignedPropertyIds = new Set((assignments || []).map((a) => String(a.property_id)));
  const availableProperties = (properties || []).filter((p) => {
    const status = String(p.status || "").toLowerCase();
    // if this is the current property, allow it
    if (String(p.id) === String(form.property_id)) return true;
    if (status !== "available") return false;
    if (assignedPropertyIds.has(String(p.id))) return false;
    return true;
  });

  // build options: current first, then available others
  const propertyOptions = () => {
    const opts = [];
    if (form.property_id) {
      const current = properties.find((p) => String(p.id) === String(form.property_id));
      if (current) opts.push(current);
      else opts.push({ id: form.property_id, title: `Property ${form.property_id}` });
    }
    availableProperties.forEach((p) => {
      if (String(p.id) !== String(form.property_id)) opts.push(p);
    });
    return opts;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const normalizePayload = (f) => ({
    property_id: f.property_id || null,
    client_id: f.client_id ? Number(f.client_id) : null,
    assigned_by: f.assigned_by ? Number(f.assigned_by) : null,
    amount: f.amount || null,
    details: f.details || null,
    assigned_at: f.assigned_at || null,
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.id) {
      setError("No assignment loaded");
      return;
    }
    // ensure chosen property not assigned to someone else
    const isAssignedElsewhere = assignments.some((a) => String(a.property_id) === String(form.property_id) && String(a.id) !== String(form.id));
    if (isAssignedElsewhere) {
      setError("Chosen property is already assigned. Pick another.");
      return;
    }

    try {
      await axios.put(`${API_ROOT}/updateassignedproperty/${form.id}`, normalizePayload(form));
      alert("Updated ✔");
      navigate("/admin/propertyassigned");
    } catch (err) {
      console.error("update", err);
      setError("Update failed");
    }
  };

  return (
    <>
      <Navbar />

      <main className="admin-panel-header-div">
        <div className="admin-dashboard-main-header" style={{ marginBottom: 24 }}>
          <div>
            <h5>Edit Assignment</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">Dashboard</Link>
              <IoMdArrowDropright />
              <Link to="/admin/propertyassigned" className="breadcrumb-link active">Assignments</Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Edit</span>
            </div>
          </div>

          <div className="admin-panel-header-add-buttons">
            <NavLink to="/admin/propertyassigned" className="cancel-btn dashboard-add-product-btn">
              <HiXMark /> Cancel
            </NavLink>

            <button onClick={handleUpdate} className="primary-btn dashboard-add-product-btn">
              <MdSave /> Save Changes
            </button>
          </div>
        </div>

        <div className="dashboard-add-content-card-div" style={{ paddingBottom: 40 }}>
          <div className="dashboard-add-content-left-side" style={{ maxWidth: 720 }}>
            <div className="dashboard-add-content-card">
              <h6>Assignment Details</h6>

              {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}

              <div className="add-product-form-container">
                <label>Client</label>
                <select name="client_id" value={form.client_id} onChange={handleChange}>
                  <option value="">-- select client --</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email || u.number || u.id})</option>)}
                </select>

                <label style={{ marginTop: 8 }}>Property</label>
                <select name="property_id" value={form.property_id} onChange={handleChange}>
                  <option value="">-- select property --</option>
                  {propertyOptions().map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title || p.id} — {p.price ? `₹${p.price}` : "-"}
                    </option>
                  ))}
                </select>

                <label style={{ marginTop: 8 }}>Assigned by (auto)</label>
                <input name="assigned_by" value={form.assigned_by} readOnly style={{ opacity: 0.9 }} />

                <label style={{ marginTop: 8 }}>Amount</label>
                <input name="amount" value={form.amount} onChange={handleChange} placeholder="e.g. 8500000" />

                <label style={{ marginTop: 8 }}>Details</label>
                <textarea name="details" value={form.details} onChange={handleChange} rows={3} />

                <label style={{ marginTop: 8 }}>Assigned at (manual)</label>
                <input type="datetime-local" name="assigned_at" value={form.assigned_at} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
