import React, { useState, useEffect } from "react";
import { FiInfo } from "react-icons/fi";

/**
 * Props:
 *  - items: array of objects { id, img, title, subtitle, count, status, address, price, description, ... }
 *  - onEdit(id) optional
 *  - onDelete(id) optional
 */
const CardList = ({ items = [], onEdit, onDelete }) => {
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 420);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 420);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="segment-filter-row">
        <div className="tabs">
          <button className="tab active">Enterprise</button>
          <button className="tab">Premium</button>
          <button className="tab">Boutique</button>
        </div>

        <div className="segmented-control">
          <button className="seg active">Secondary</button>
          <button className="seg">Primary</button>
        </div>
      </div>

      <div className="cardlist">
        {items && items.length ? (
          items.map((it) => (
            <article key={it.id} className="card-row" onClick={() => setSelected(it)} role="button" tabIndex={0}>
              <div className="card-left">
                <img src={it.img ? `/uploads/${it.img}` : it.logo || "/placeholder-64.png"} alt={it.title} />
              </div>

              <div className="card-middle">
                <div className="card-title">{it.title}</div>
                {!isMobile && <div className="card-sub">{it.subtitle || it.address || ""}</div>}
              </div>

              <div className="card-right">
                <div className="count-pill">{it.count ?? it.trucheck ?? 0}</div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty">No items found</div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="detail-modal-overlay" onClick={() => setSelected(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="header-left">
                <img src={selected.img ? `/uploads/${selected.img}` : selected.logo || "/placeholder-64.png"} alt={selected.title} />
                <div>
                  <h3>{selected.title}</h3>
                  <p className="muted">{selected.subtitle || selected.address}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelected(null)} aria-label="Close">✕</button>
            </div>

            <div className="detail-modal-body">
              <div className="detail-row"><strong>Count:</strong> {selected.count ?? selected.trucheck ?? 0}</div>
              {selected.price && <div className="detail-row"><strong>Price:</strong> ₹{selected.price}</div>}
              {selected.description && <div className="detail-row"><strong>Description:</strong><p>{selected.description}</p></div>}
              {selected.status && <div className="detail-row"><strong>Status:</strong> {selected.status}</div>}
            </div>

            <div className="detail-modal-footer">
              <button className="primary-btn" onClick={() => { onEdit?.(selected.id); }}>Edit</button>
              <button className="cancel-btn" onClick={() => { onDelete?.(selected.id); setSelected(null); }}>Delete</button>
              <button className="info-btn" onClick={() => setSelected(null)}><FiInfo /> Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardList;
