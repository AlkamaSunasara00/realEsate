const connection = require("../../connection/connection");

// ✅ Get all assigned properties
const getAssignedProperties = (req, res) => {
  const q = "SELECT * FROM assigned_properties";
  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    return res.status(200).json(data);
  });
};

// ✅ Get assigned property by id
const getAssignedPropertyById = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM assigned_properties WHERE id = ?";
  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (!data || data.length === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json(data[0]);
  });
};
const getAssignedPropertyByClientId = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM assigned_properties WHERE client_id = ?";
  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (!data || data.length === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json(data);
  });
};

// ✅ Add new assignment
const addAssignedProperty = (req, res) => {
  const { property_id, client_id, assigned_by, amount, details, assigned_at } = req.body;

  const insertQ = `
    INSERT INTO assigned_properties 
    (property_id, client_id, assigned_by, amount, details, assigned_at) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    property_id || null,
    client_id || null,
    assigned_by || null,
    amount || null,
    details || null,
    assigned_at || new Date().toISOString(),
  ];

  connection.query(insertQ, values, (err, result) => {
    if (err) {
      console.error("Error inserting assignment:", err);
      return res.status(500).json({ error: "database error", details: err });
    }

    // ✅ after assigning, mark property as "reserved"
    const updateQ = "UPDATE properties SET status = 'reserved' WHERE id = ?";
    connection.query(updateQ, [property_id], (err2) => {
      if (err2) {
        console.error("Failed to update property status:", err2);
        return res.status(500).json({
          message: "Assignment added but property status not updated",
          details: err2,
        });
      }

      return res
        .status(201)
        .json({ message: "assigned successfully & property reserved", insertId: result.insertId });
    });
  });
};


// ✅ Update an assignment (simple update)
const updateAssignedProperty = (req, res) => {
  const { id } = req.params;
  const { property_id, client_id, assigned_by, amount, details, assigned_at } = req.body;

  const q = `
    UPDATE assigned_properties 
    SET 
      property_id = COALESCE(?, property_id),
      client_id = COALESCE(?, client_id),
      assigned_by = COALESCE(?, assigned_by),
      amount = COALESCE(?, amount),
      details = COALESCE(?, details),
      assigned_at = COALESCE(?, assigned_at)
    WHERE id = ?`;

  const values = [property_id, client_id, assigned_by, amount, details, assigned_at, id];

  connection.query(q, values, (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "updated successfully" });
  });
};

// ✅ Delete an assignment
const deleteAssignedProperty = (req, res) => {
  const { id } = req.params;

  // first get property_id from assignment
  const selectQ = "SELECT property_id FROM assigned_properties WHERE id = ?";
  connection.query(selectQ, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (!rows || rows.length === 0) return res.status(404).json({ error: "assignment not found" });

    const propertyId = rows[0].property_id;

    // then delete the assignment
    const deleteQ = "DELETE FROM assigned_properties WHERE id = ?";
    connection.query(deleteQ, [id], (err2, result) => {
      if (err2) return res.status(500).json({ error: "database error" });
      if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });

      // finally, mark property available again
      const updateQ = "UPDATE properties SET status = 'available' WHERE id = ?";
      connection.query(updateQ, [propertyId], (err3) => {
        if (err3) console.error("failed to reset property status", err3);
        return res.status(200).json({ message: "deleted & property unreserved" });
      });
    });
  });
};


module.exports = {
  getAssignedProperties,
  getAssignedPropertyById,
  getAssignedPropertyByClientId,
  addAssignedProperty,
  updateAssignedProperty,
  deleteAssignedProperty,
};
