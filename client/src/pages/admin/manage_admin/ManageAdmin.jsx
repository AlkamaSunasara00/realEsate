import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";

import api from "../../../api/axiosInstance";
import { NavLink, useNavigate } from "react-router-dom";

const ManageAdmin = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/clients");
        setAdmins(res.data)
      } catch (error) {
        console.error(error);

      }
    };

    fetchClients();
  }, []);

  const filtered = admins.filter((a) =>
    activeTab === "All" ? true : activeTab === "Active" ? a.status === "active" : a.status === "block"
  );

  const navigate = useNavigate()

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        <Breadcrumb
          title="Admin"
          breadcrumbText="Admin List"
          button={{ link: "/admin/add-new_admin", text: "Add New Admin" }}
        />

        <div className="admin-panel-header-tabs">
          <button className={activeTab === "All" ? "active" : ""} onClick={() => setActiveTab("All")}>All</button>
          <button className={activeTab === "Active" ? "active" : ""} onClick={() => setActiveTab("Active")}>Active</button>
          <button className={activeTab === "Blocked" ? "active" : ""} onClick={() => setActiveTab("Blocked")}>Blocked</button>
        </div>

        <div className="dashboard-table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone No</th>
                <th>Status</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((a) => (

                <tr key={a.id}>
                  <td className="product-info admin-profile">
                    <img src={`/uploads/${a.img}`} alt="profile_image" />
                    <span>{a.name}</span>
                  </td>
                  <td>{a.email}</td>
                  <td>{a.number}</td>
                  <td>
                    <span className={`status ${a.status === "active" ? "published" : "out-of-stock"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.createdat?.slice(0, 10)}</td>

                  <td className="actions">
                    <FaRegEye onClick={() => navigate(`/admin/view-admin/${a.id}`)}/>
                    <IoPencil onClick={() => navigate(`/admin/edit-admin/${a.id}`)} className="edit-btn" />
                    <MdDeleteForever onClick={() => handleDelete(a.id)} className="delete-btn" />
                  </td>
                </tr>

              ))}
            </tbody>
          </table>
        </div>

      </main>
    </>
  );
};

export default ManageAdmin;
