const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Middleware validation

function hasData(req, res, next) {
  const { data } = req.body;
  if (!data) {
    return next({
      status:400,
      message: "Data is missing."
    })
  }
  next();
} 
async function validTable(req, res, next) {
  const { data } = req.body;
  const errorMsgs = [];
  const requiredFields = [
    "table_name",
    "capacity"
  ];

  requiredFields.forEach((field) => {
    if (!data[field]) {
      errorMsgs.push(`Please enter a ${field}.`)
    }
  });
  if (data.table_name && data.table_name.length <= 1) {
    errorMsgs.push("The table_name must be more than one character.")
  }
  if (!Number.isInteger(data.capacity) || data.capacity < 1) {
    errorMsgs.push("The capacity must be a number greater than zero.")
  }
  if (errorMsgs.length) {
    next({
      status: 400,
      message: errorMsgs.join(" ")
    })
  }
  next();
}

function hasId(req, res, next) {
  if (!req.body.data.reservation_id) {
    next({
      status: 400,
      message: "Missing reservation_id."
    })
  }
  next();
}

async function validUpdate(req, res, next) {
  let table = await service.read(req.params.table_id);
  let reservation = await service.readRes(req.body.data.reservation_id)
  if (!reservation) {
    next({
      status: 404,
      message: `${req.body.data.reservation_id} does not exist.`
    })
  }
  if (table.capacity < reservation.people) {
    next({
      status: 400,
      message: `This table does not have sufficient capacity for this reservation.`
    })
  }
  if (table.reservation_id) {
    next({
      status: 400,
      message: `This table is occupied.`
    })
  }
  next();
}

async function tableOccupied(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (!table) {
    next({
      status: 404,
      message: `Table ${table_id} cannot be found`
    })
  }
  if (!table.reservation_id) {
    next({
      status: 400,
      message: `This table is not occupied`
    })
  }
  res.locals.table = table;
  next();
}

// CRUD functions
async function list(req, res) {
  const data = await service.list();
  res.status(200).json({ data });
};

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data })
}

async function update(req, res) {
  const {table_id} = req.params;
  const data = await service.update(table_id, req.body.data);

  res.status(200).json({ data })
}

async function destroy(req, res) {
  const {table_id} = res.locals.table
  const data = await service.delete(table_id)
  res.status(200).json({data})
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [hasData, validTable, asyncErrorBoundary(create)],
  update: [hasData, hasId, asyncErrorBoundary(validUpdate), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(tableOccupied), asyncErrorBoundary(destroy)]
}