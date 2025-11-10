const connection = require("../../connection/connection");

// Get all confirmations (most recent first)
const getAllConfirmations = (req, res) => {
  const sql = `
    SELECT * FROM payment_confirmations
  `;

  connection.query(sql, (err, rows) => {
    if (err) {
      console.error("getAllConfirmations error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.status(200).json(rows);
  });
};

// Get single confirmation by id
const getConfirmationById = (req, res) => {
  const id = req.params.id;
  const sql = `
   SELECT * FROM payment_confirmations WHERE id = ? ;

  `;
  connection.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("getConfirmationById error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!rows.length) return res.status(404).json({ error: "Confirmation not found" });
    return res.status(200).json(rows[0]);
  });
};

// Create new confirmation
// Accepts multipart/form-data (field "signature" for file)
const createConfirmation = (req, res) => {
  const {
    payment_id,
    sent_by,       // id from admin table (role=client)
    confirmed_by,  // id from admin table (role=admin)
    status,        // 'confirmed' or 'rejected' (required)
    confirmed_at,  // manual datetime string (optional)
    reject_reason, // optional
  } = req.body;

  const signatureFile = req.file ? req.file.filename : null;

  if (!payment_id || !status) {
    return res.status(400).json({ error: "payment_id and status are required" });
  }

  const sql = `
    INSERT INTO payment_confirmations
      (payment_id, sent_by, confirmed_by, status, confirmed_at, signature, reject_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    payment_id,
    sent_by || null,
    confirmed_by || null,
    status,
    confirmed_at || null,
    signatureFile,
    reject_reason || null,
  ];

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error("createConfirmation error:", err);
      return res.status(500).json({ error: "Insert failed", details: err });
    }
    return res.status(201).json({ message: "Confirmation created", id: result.insertId });
  });
};

// Update confirmation (partial update supported)
// Accepts multipart/form-data for signature if you want to replace it
const updateConfirmation = (req, res) => {
  const id = req.params.id;
  const {
    payment_id,
    sent_by,
    confirmed_by,
    status,
    confirmed_at,
    reject_reason,
  } = req.body;
  const signatureFile = req.file ? req.file.filename : null;

  const sql = `
    UPDATE payment_confirmations
    SET
      payment_id    = COALESCE(?, payment_id),
      sent_by       = COALESCE(?, sent_by),
      confirmed_by  = COALESCE(?, confirmed_by),
      status        = COALESCE(?, status),
      confirmed_at  = COALESCE(?, confirmed_at),
      signature     = COALESCE(?, signature),
      reject_reason = COALESCE(?, reject_reason),
      updated_at    = NOW()
    WHERE id = ?
  `;
  const params = [
    payment_id || null,
    sent_by || null,
    confirmed_by || null,
    status || null,
    confirmed_at || null,
    signatureFile || null,
    reject_reason || null,
    id,
  ];

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateConfirmation error:", err);
      return res.status(500).json({ error: "Update failed", details: err });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "Confirmation not found" });
    return res.status(200).json({ message: "Confirmation updated" });
  });
};

// Delete confirmation
const deleteConfirmation = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM payment_confirmations WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("deleteConfirmation error:", err);
      return res.status(500).json({ error: "Delete failed" });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "Confirmation not found" });
    return res.status(200).json({ message: "Confirmation deleted" });
  });
};

module.exports = {
  getAllConfirmations,
  getConfirmationById,
  createConfirmation,
  updateConfirmation,
  deleteConfirmation,
};
