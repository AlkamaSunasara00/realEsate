// middleware/authorizeRole.js
// simple middleware to restrict routes to given roles
module.exports = function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    const decoded = req.admin || {};
    const role = decoded.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden — insufficient privileges' });
    }
    next();
  };
};
