// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { FiArrowLeft } from "react-icons/fi";
// import "../../assets/css/client/details.css";
// import api from "../../api/axiosInstance";

// const PropertyDetails = () => {
//   const { state } = useLocation();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [property, setProperty] = useState(state?.item || null);
//   const [loading, setLoading] = useState(!state?.item);

//   // Fetch property if not passed via state
//   useEffect(() => {
//     if (!property) {
//       const fetchProperty = async () => {
//         try {
//           setLoading(true);
//           const res = await api.get("http://localhost:4500/getproperties");
//           const foundProperty = res.data.find(p => p.id === parseInt(id));
//           setProperty(foundProperty || null);
//         } catch (err) {
//           console.error("Failed to load property:", err);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchProperty();
//     }
//   }, [id, property]);

//   if (loading) {
//     return (
//       <section className="property-details">
//         <div className="container">Loading property details...</div>
//       </section>
//     );
//   }

//   if (!property) {
//     return (
//       <section className="property-details">
//         <div className="container">Property not found</div>
//       </section>
//     );
//   }

//   return (
//     <section className="property-details">
//       <div className="container">
//         <button className="back-btn" onClick={() => navigate(-1)}>
//           <FiArrowLeft /> Back
//         </button>
//         <div className="details-grid">
//           <img src={`/uploads/${property.image}`} alt={property.title} />
//           <div className="details-content">
//             <h1>{property.title}</h1>
//             <p className="price">₹{property.price.toLocaleString()}</p>
//             <p className="address">{property.address}</p>
//             <p className="description">{property.description}</p>
//             <span className={`status-badge ${property.status}`}>{property.status}</span>
//             <div className="actions">
//               <button className="btn btn-primary">Contact Agent</button>
//               <button className="btn btn-outline">Schedule Visit</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PropertyDetails;
