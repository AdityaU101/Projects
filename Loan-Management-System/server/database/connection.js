const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Password@123",
  database: "Loan_System",
  multipleStatements: true,
});

connection.connect((error) => {
  if (error) throw error;
  console.log("Connected to the database!");
});

module.exports = connection;
