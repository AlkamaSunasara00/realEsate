// controller/login/login.js
const bcrypt = require('bcrypt');
const connection = require('../../connection/connection');
const { generateAccessToken } = require('../../utils/jwtUtils');

const login = (req, res) => {
  const { identifier, password } = req.body;
  const ip = req.ip || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required' });
  }

  const sql = 'SELECT * FROM admin WHERE email = ? OR number = ?';
  connection.query(sql, [identifier, identifier], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = results[0];
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Invalidate previous active tokens for this admin (single-session behavior)
    connection.query(
      'UPDATE active_tokens SET is_blacklisted = 1 WHERE admin_id = ? AND is_blacklisted = 0',
      [admin.id]
    );

    const { token: accessToken, jti } = generateAccessToken(admin, ip, userAgent);
    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 60 * 1000);

    connection.query(
      'INSERT INTO active_tokens (token_id, admin_id, ip_address, user_agent, issued_at, last_activity, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [jti, admin.id, ip, userAgent, now, now, expires],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to create session' });
        }
        // Return the role too so frontend can adapt UI
        res.json({
          accessToken,
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role || 'client', // default fallback
            status: admin.status,
            img: admin.img || null
          }
        });
      }
    );
  });
};

const refreshToken = (req, res) => {
  const decoded = req.admin; // verifyToken now attaches decoded token
  const { jti, id: adminId } = decoded;
  const ip = req.ip || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  connection.query(
    'SELECT * FROM active_tokens WHERE token_id = ? AND admin_id = ? AND is_blacklisted = 0',
    [jti, adminId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(401).json({ error: 'Session not found or invalid' });

      const tokenData = results[0];
      const now = new Date();
      const lastActivity = new Date(tokenData.last_activity);

      // **SLIDING SESSION CHECK**
      if (now - lastActivity > 15 * 60 * 1000) {
        connection.query('UPDATE active_tokens SET is_blacklisted = 1 WHERE token_id = ?', [jti]);
        return res.status(401).json({ error: 'Session expired due to inactivity' });
      }

      connection.query('SELECT * FROM admin WHERE id = ?', [adminId], (err, adminResults) => {
        if (err || adminResults.length === 0) return res.status(401).json({ error: 'User not found' });

        const admin = adminResults[0];

        // Current token invalidate
        connection.query('UPDATE active_tokens SET is_blacklisted = 1 WHERE token_id = ?', [jti], () => {

          const { token: newToken, jti: newJti } = generateAccessToken(admin, ip, userAgent);
          const newExpires = new Date(now.getTime() + 15 * 60 * 1000);

          connection.query(
            'INSERT INTO active_tokens (token_id, admin_id, ip_address, user_agent, issued_at, last_activity, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newJti, adminId, ip, userAgent, now, now, newExpires],
            (err) => {
              if (err) return res.status(500).json({ error: 'Failed to refresh token' });
              res.json({ accessToken: newToken });
            }
          );
        });
      });
    }
  );
};

const updateActivity = (req, res) => {
  const decoded = req.admin;
  const { jti, id: adminId } = decoded;
  const now = new Date();

  connection.query(
    'UPDATE active_tokens SET last_activity = ? WHERE token_id = ? AND admin_id = ? AND is_blacklisted = 0',
    [now, jti, adminId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update activity' });
      }
      res.json({ message: 'Activity updated' });
    }
  );
};

const logout = (req, res) => {
  const decoded = req.admin;
  const { jti, id: adminId } = decoded;
  connection.query(
    'UPDATE active_tokens SET is_blacklisted = 1 WHERE token_id = ? AND admin_id = ?',
    [jti, adminId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    }
  );
};

const getUserById = (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid admin ID' });
  }

  connection.query(
    'SELECT id, name, email, number, img ,status, createdat, updatedat, role FROM admin WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      res.json(results[0]);
    }
  );
};

// addClient, getClient, updateClient, deleteClient left as-is (you may protect them with authorizeRole middleware)
const addClient = async (req, res) => {
  const { name, email, number, password, status } = req.body;

  let profileImage = req.file ? req.file.filename : "default.png";

  if (!name || !email || !number || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO admin (name, email, number, password, img, role, status) 
               VALUES (?, ?, ?, ?, ?, 'client', ?)`;

  connection.query(sql, [name, email, number, hashedPass, profileImage, status], (err, result) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json({ message: "Client added successfully", clientId: result.insertId });
  });
};

const getClient = (req, res) => {
  connection.query(
    "SELECT id, name, email, number, img ,status, createdat FROM admin WHERE role='client'",
    (err, results) => {
      if (err) return res.status(500).json({ error: 'DB Error' });
      res.json(results);
    }
  );
};

const updateClient = async (req, res) => {
  const { name, email, number, alt_number, password, status } = req.body;
  const { id } = req.params;

  const profileImage = req.file ? req.file.filename : null;

  let updates = [];
  let values = [];

  if (name) { updates.push("name=?"); values.push(name); }
  if (email) { updates.push("email=?"); values.push(email); }
  if (number) { updates.push("number=?"); values.push(number); }
  if (alt_number) { updates.push("alt_number=?"); values.push(alt_number); }
  if (status) { updates.push("status=?"); values.push(status); }
  if (profileImage) { updates.push("img=?"); values.push(profileImage); }
  if (password) {
    const hashedPass = await bcrypt.hash(password, 10);
    updates.push("password=?");
    values.push(hashedPass);
  }

  values.push(id);

  const sql = `UPDATE admin SET ${updates.join(', ')} WHERE id=?`;

  connection.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json({ message: "Admin updated successfully" });
  });
};

const deleteClient = (req, res) => {
  const { id } = req.params;

  connection.query("DELETE FROM admin WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json({ message: "Admin deleted successfully" });
  });
};

module.exports = {
  login,
  refreshToken,
  updateActivity,
  logout,
  getUserById,
  addClient,
  getClient,
  updateClient,
  deleteClient
};
