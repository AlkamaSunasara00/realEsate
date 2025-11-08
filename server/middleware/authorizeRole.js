// middleware/authorizeRole.js
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.admin || {};
    const role = user.role;

    if (!role || !allowedRoles.includes(role)) {
      console.warn(`Access denied: user role=${role}, allowed=${allowedRoles}`);
      return res
        .status(403)
        .json({ error: 'Forbidden — insufficient privileges' });
    }

    next();
  };
};
