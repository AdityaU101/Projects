const connection = require("../database/connection");

function queryDatabase(query, response) {
  connection.query(query, (error, result) => {
    if (error) response.status(404).json({ message: error.message });
    if (response) return response.send(result);
    return;
  });
}

function queryDatabaseWithParams(query, params, response) {
  connection.query(query, params, (error, result) => {
    if (error) response.status(404).json({ message: error.message });
    if (response) return response.send(result);
    return;
  });
}

function queryDatabaseWithParamsWithoutResponse(query, params) {
  connection.query(query, params, (error, result) => {
    return result;
  });
}

module.exports = { queryDatabase, queryDatabaseWithParams, queryDatabaseWithParamsWithoutResponse };
