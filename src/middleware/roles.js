// usage: authorize(['admin','editor'])
const authorize = (allowed = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const hasRole = req.user.roles.some(r => allowed.includes(r));
  if (!hasRole) return res.status(403).json({ message: "Forbidden - insufficient role" });
  next();
};

module.exports = authorize;
