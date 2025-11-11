// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../../assets/css/client/properties.css";
// import api from "../../api/axiosInstance";

// const Properties = () => {
//   const navigate = useNavigate();
//   const [properties, setProperties] = useState([]);
//   const [filteredProperties, setFilteredProperties] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [loading, setLoading] = useState(true);

//   // Fetch properties from API
//   useEffect(() => {
//     const fetchProperties = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get("http://localhost:4500/getproperties");
//         setProperties(res.data || []);
//         setFilteredProperties(res.data || []);
//       } catch (err) {
//         console.error("Failed to load properties:", err);
//         alert("Failed to load properties");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProperties();
//   }, []);

//   // Handle search and filter
//   useEffect(() => {
//     let filtered = properties;

//     // Apply status filter
//     if (statusFilter !== "All") {
//       filtered = filtered.filter(p => p.status === statusFilter.toLowerCase());
//     }

//     // Apply search filter
//     if (searchTerm) {
//       filtered = filtered.filter(p =>
//         p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.description?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     setFilteredProperties(filtered);
//   }, [searchTerm, statusFilter, properties]);

//   if (loading) {
//     return (
//       <section className="properties-page">
//         <div className="container">
//           <div className="loading">Loading properties...</div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="properties-page">
//       <div className="container">
//         <h1 className="page-title">All Properties</h1>

//         {/* Search and Filter Section */}
//         <div className="filter-section">
//           <input
//             type="text"
//             placeholder="Search by title, address, or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="search-input"
//           />
          
//           <div className="status-filters">
//             {["All", "Available", "Reserved", "Sold"].map(status => (
//               <button
//                 key={status}
//                 className={`filter-btn ${statusFilter === status ? "active" : ""}`}
//                 onClick={() => setStatusFilter(status)}
//               >
//                 {status}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Properties Grid */}
//         <div className="properties-grid">
//           {filteredProperties.length > 0 ? (
//             filteredProperties.map(p => (
//               <div
//                 key={p.id}
//                 className="property-card"
//                 onClick={() => navigate(`/property/${p.id}`, { state: { item: p } })}
//               >
//                 <img src={`/uploads/${p.image}`} alt={p.title} />
//                 <div className="card-content">
//                   <h3>{p.title}</h3>
//                   <p className="price">₹{p.price.toLocaleString()}</p>
//                   <p className="address">{p.address}</p>
//                   <span className={`status-badge ${p.status}`}>{p.status}</span>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="no-results">No properties found</div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Properties;
