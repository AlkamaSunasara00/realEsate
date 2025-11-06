import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

const API_ROOT = "http://localhost:4500";

export default function GetAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get(`${API_ROOT}/admin/clients`);
      setUsers(res.data || []);
    } catch (err) {
      console.error("fetchUsers", err);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/getproperties`);
      setProperties(res.data || []);
    } catch (err) {
      console.error("fetchProperties", err);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ROOT}/getassignedproperties`);
      setAssignments(res.data || []);
    } catch (err) {
      console.error("fetchAssignments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchUsers(), fetchProperties(), fetchAssignments()]);
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await axios.delete(`${API_ROOT}/deleteassignedproperty/${id}`);
      await fetchAssignments();
      await fetchProperties();
      alert("Deleted");
    } catch (err) {
      console.error("delete error", err);
      alert("Delete failed");
    }
  };

  return (
    <>
      <Navbar />

      <main className="admin-panel-header-div">
        <Breadcrumb
          title="Assignments"
          breadcrumbText="Assigned Properties"
          button={{ link: "/admin/addpropertyassigned", text: "Create Assignment" }}
        />

        <div className="dashboard-table-container" style={{ paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ margin: 0 }}>All assignments</h4>
            <div>
              <button onClick={fetchAssignments} className="primary-btn">Refresh</button>
            </div>
          </div>

          {loading ? (
            <div style={{ opacity: 0.7 }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Details</th>
                  <th>Assigned At</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", opacity: 0.6 }}>No assignments</td>
                  </tr>
                ) : (
                  assignments.map((a) => {
                    const clientName = a.client_name || (users.find((u) => u.id === a.client_id)?.name) || a.client_id;
                    const propertyTitle = a.property_title || (properties.find((p) => p.id === a.property_id)?.title) || a.property_id;
                    const at = a.assigned_at ? String(a.assigned_at).replace("T", " ").slice(0, 16) : "-";
                    return (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{clientName}</td>
                        <td>{propertyTitle}</td>
                        <td>{a.amount ?? "-"}</td>
                        <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.details || "-"}</td>
                        <td>{a.assigned_at ? at : "-"}</td>
                        <td className="actions">
                          <IoPencil
                            className="edit-btn"
                            onClick={() => navigate("/admin/updatepropertyassigned", { state: { item: a } })}
                            style={{ cursor: "pointer", marginRight: 10 }}
                          />
                          <MdDeleteForever
                            className="delete-btn"
                            onClick={() => handleDelete(a.id)}
                            style={{ cursor: "pointer", color: "crimson" }}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
