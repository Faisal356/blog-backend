module.exports = function paginate(query, { page = 1, limit = 10 } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;
  return { query, options: { skip, limit: l, page: p } };
};
