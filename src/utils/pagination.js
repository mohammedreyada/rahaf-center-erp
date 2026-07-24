exports.getPagination = (query) => {
  const page = Math.abs(parseInt(query.page, 10)) || 1;
  const limit = Math.abs(parseInt(query.limit, 10)) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};