const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: "Authorization header missing" });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access token missing" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
    if (err) return res.status(403).json({ error: "Invalid or expired access token" });

    if (admin.status === "block") {
      return res.status(403).json({ error: "Your account is blocked" });
    }

    req.admin = admin;
    next();
  });
};

module.exports = authenticateToken;
