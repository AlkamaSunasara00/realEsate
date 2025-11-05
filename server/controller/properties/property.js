const connection = require("../../connection/connection");

// get all properties
const getProperties = (req, res) => {
  const q = "SELECT * FROM properties";
  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    return res.status(200).json(data);
  });
};

// get single property by id
const getPropertyById = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM properties WHERE id = ?";
  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (!data || data.length === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json(data[0]);
  });
};

// add new property
const addProperty = (req, res) => {
  const { title, description, address, price, status } = req.body;
  const image = req.file ? req.file.filename : null;
  // id is assumed char(36) with uuid() default in DB; createdAt/updatedAt handled by DB or null
  const q = `INSERT INTO properties (title, description, address, price, status, image)
             VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [title || null, description || null, address || null, price || 0.0, status || "available", image];
  connection.query(q, params, (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    return res.status(201).json({ message: "created", insertId: result.insertId });
  });
};

// update property (partial update allowed)
const updateProperty = (req, res) => {
  const { id } = req.params;
  const { title, description, address, price, status } = req.body;
  const image = req.file ? req.file.filename : null;


  const q = `UPDATE properties SET title = COALESCE(?, title),
                                   description = COALESCE(?, description),
                                   address = COALESCE(?, address),
                                   price = COALESCE(?, price),
                                   status = COALESCE(?, status),
                                   image = COALESCE(?, image),
                                   updatedAt = NOW()
             WHERE id = ?`;
  const params = [title, description, address, price, status, image, id];
  connection.query(q, params, (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "updated" });
  });
};

// delete property
const deleteProperty = (req, res) => {
  const { id } = req.params;
  const q = "DELETE FROM properties WHERE id = ?";
  connection.query(q, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "deleted" });
  });
};

module.exports = {
  getProperties,
  getPropertyById,
  addProperty,
  updateProperty,
  deleteProperty,
};
