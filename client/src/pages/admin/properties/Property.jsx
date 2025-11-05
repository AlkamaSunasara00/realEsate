import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GetProperties = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  // fetch all properties
  const fetchProperties = async () => {
    try {
      const res = await axios.get("http://localhost:4500/getproperties");
      setProperties(res.data || []);
    } catch (err) {
      console.error("fetchProperties error", err);
      alert("Failed to fetch properties");
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // delete property
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await axios.delete(`http://localhost:4500/deleteproperty/${id}`);
      await fetchProperties();
      alert("Property deleted successfully ");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete property ");
    }
  };

  // filter by status
  const filtered = properties.filter((p) =>
    activeTab === "All"
      ? true
      : activeTab === "Available"
      ? p.status === "available"
      : activeTab === "Reserved"
      ? p.status === "reserved"
      : p.status === "sold"
  );

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        <Breadcrumb
          title="Properties"
          breadcrumbText="Property List"
          button={{ link: "/admin/addproperty", text: "Add New Property" }}
        />

        {/* Filter Tabs */}
        <div className="admin-panel-header-tabs">
          <button
            className={activeTab === "All" ? "active" : ""}
            onClick={() => setActiveTab("All")}
          >
            All
          </button>
          <button
            className={activeTab === "Available" ? "active" : ""}
            onClick={() => setActiveTab("Available")}
          >
            Available
          </button>
          <button
            className={activeTab === "Reserved" ? "active" : ""}
            onClick={() => setActiveTab("Reserved")}
          >
            Reserved
          </button>
          <button
            className={activeTab === "Sold" ? "active" : ""}
            onClick={() => setActiveTab("Sold")}
          >
            Sold
          </button>
        </div>

        {/* Table Section */}
        <div className="dashboard-table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Address</th>
                <th>Price</th>
                <th>Status</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="product-info admin-profile">
                      <img
                        src={`/uploads/${p.image}`}
                        alt="Property"
                        style={{
                          width: "80px",
                          height: "60px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>{p.title}</td>
                    <td>{p.description}</td>
                    <td>{p.address}</td>
                    <td>₹{p.price}</td>
                    <td>
                      <span
                        className={`status ${
                          p.status === "available"
                            ? "published"
                            : p.status === "reserved"
                            ? "pending"
                            : "out-of-stock"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>{p.createdat?.slice(0, 10) || "—"}</td>
                    <td className="actions">
                      <IoPencil
                        onClick={() =>
                          navigate("/admin/updateproperty", { state: { item: p } })
                        }
                        className="edit-btn"
                      />
                      <MdDeleteForever
                        onClick={() => handleDelete(p.id)}
                        className="delete-btn"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", opacity: 0.7 }}>
                    No properties found 
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default GetProperties;
