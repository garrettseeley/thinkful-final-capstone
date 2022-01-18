const service = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")
/**
 * List handler for reservation resources
 */
async function list(req, res) {
  res.json({
    data: [],
  });
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data })
}

module.exports = {
  list,
  create: asyncErrorBoundary(create)
};
