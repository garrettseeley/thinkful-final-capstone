const knex = require("../db/connection");

function list() {
  return knex("tables").select("*").orderBy("table_name", "asc");
}

function read(table_id) {
  return knex("tables").select("*").where({ table_id: table_id }).first();
}

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdTable) => createdTable[0]);
}

function update(table_id, { reservation_id }) {
  return knex("tables")
    .where({ table_id: table_id })
    .update({ reservation_id })
    .returning("*")
    .then((table) => table[0]);
}

function destroy(table_id) {
  return knex("tables")
    .where({ table_id })
    .update({ reservation_id: null })
    .returning("*")
    .then((table) => table[0]);
}

module.exports = {
  list,
  create,
  read,
  update,
  delete: destroy,
};
