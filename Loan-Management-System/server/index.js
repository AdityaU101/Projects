const express = require("express");
const cors = require("cors");
const query = require("./database/queries");

const app = express();
app.use(express.json());
app.use(cors());

const generateId = () => +(Math.random() * 1000000).toFixed(0);
const getDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

app.get("/api/dashboard", (request, response) => {
  const sql = `
      select * from Dashboard_Stats
  `;

  query.queryDatabase(sql, response);
});

app.get("/api/bank", (request, response) => {
  const sql = `
    select * from Bank
  `;

  query.queryDatabase(sql, response);
});

app.post("/api/bank", (request, response) => {
  const { name, address, estd } = request.body;
  const id = generateId();

  const sql = `
    insert into Bank values(?, ?, ?, ?)
  `;

  query.queryDatabaseWithParams(sql, [id, name, address, estd], response);
});

app.get("/api/manager", (request, response) => {
  const sql = `
    select * from Loan_Officer
  `;

  query.queryDatabase(sql, response);
});

app.post("/api/manager", (request, response) => {
  const { name, email, phoneNumber, branchId } = request.body;
  const id = generateId();

  const sql = `
    insert into Loan_Officer values(?, ?, ?, ?, ?)
  `;

  query.queryDatabaseWithParams(sql, [id, name, email, phoneNumber, branchId], response);
});

app.get("/api/branch", (request, response) => {
  const sql = `
    select * from Branch
  `;

  query.queryDatabase(sql, response);
});

app.post("/api/branch", (request, response) => {
  const { name, location, bankCode } = request.body;
  const id = generateId();

  const sql = `
    insert into Branch values(?, ?, ?, ?)
  `;

  query.queryDatabaseWithParams(sql, [id, name, location, bankCode], response);
});

app.get("/api/customer", (request, response) => {
  const sql = `
    select * from Customer
  `;

  query.queryDatabase(sql, response);
});

app.post("/api/customer", (request, response) => {
  const { name, address, email, phoneNumber } = request.body;
  const id = generateId();

  const sql = `
    insert into Customer values(?, ?, ?, ?, ?)
  `;

  query.queryDatabaseWithParams(sql, [id, name, address, email, phoneNumber], response);
});

app.get("/api/loan", (request, response) => {
  const sql = `
      select *
      from Loan
      JOIN Loan_Customer_Mapping
      on Loan.Id = Loan_Customer_Mapping.Loan_id;
  `;

  query.queryDatabase(sql, response);
});

app.get("/api/loan/:id", (request, response) => {
  const id = request.params.id;
  const sql = `
    select *
    from Loan
    JOIN Loan_Customer_Mapping
    on Loan.Id = Loan_Customer_Mapping.Loan_id
    JOIN Customer
    on Customer.Id = Loan_Customer_Mapping.Customer_id
    having Loan_id = ?
  `;

  query.queryDatabaseWithParams(sql, [id], response);
});

app.post("/api/loan", (request, response) => {
  const { amount, interestRate, term, branchCode, customerCode } = request.body;
  const id = generateId();
  const date = getDate();

  const sql = `
    START TRANSACTION;
    INSERT INTO Loan VALUES (?, ?, ?, ?, ?, ?);
    INSERT INTO Loan_Customer_Mapping VALUES (?, ?, 0, "Pending");
    COMMIT;
  `;

  query.queryDatabaseWithParams(sql, [id, amount, interestRate, term, date, branchCode, customerCode, id], response);
});

app.put("/api/loan/:id", (request, response) => {
  const id = request.params.id;
  const { status } = request.body;

  const sql = `
    update Loan_Customer_Mapping
    set Status = ?
    where Loan_Id = ?
  `;

  query.queryDatabaseWithParams(sql, [status, id], response);
});

app.get("/api/payment", (request, response) => {
  const sql = `
    select * from Payment
  `;

  query.queryDatabase(sql, response);
});

app.get("/api/payment/:id", (request, response) => {
  const id = request.params.id;
  const sql = `
      select * 
      from Payment
      where Loan_id = ?;  
  `;

  query.queryDatabaseWithParams(sql, [id], response);
});

app.post("/api/payment", (request, response) => {
  const { amount, method, loanId } = request.body;
  const id = generateId();
  const date = getDate();

  const sql = `
    START TRANSACTION;
    INSERT INTO Payment VALUES (?, ?, ?, ?, ?);
    UPDATE Loan_Customer_Mapping 
    SET Amount_repaid = Amount_repaid + ?
    WHERE Loan_id = ?;
    COMMIT;
  `;
  query.queryDatabaseWithParams(sql, [id, amount, date, method, loanId, amount, loanId], response);
});

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

app.put("/api/bank/:id", (request, response) => {
  const id = request.params.id;
  const { name, address } = request.body; // Updated fields

  const sql = `
    UPDATE Bank SET Name = ?, Addr = ?
    WHERE Code = ?
  `;

  query.queryDatabaseWithParams(sql, [name, address, id], response);
});

app.put("/api/manager/:id", (request, response) => {
  const id = request.params.id;
  const { name, email, phoneNumber, branchId } = request.body;

  const sql = `
    UPDATE Loan_Officer SET Name = ?, Email = ?, Phone_number = ?
    WHERE Id = ?
  `;

  query.queryDatabaseWithParams(sql, [name, email, phoneNumber, branchId, id], response);
});

app.put("/api/branch/:id", (request, response) => {
  const id = request.params.id;
  const { name, location } = request.body;

  const sql = `
    UPDATE Branch SET Name = ?, Location = ?
    WHERE Id = ?
  `;

  query.queryDatabaseWithParams(sql, [name, location, id], response);
});

app.put("/api/customer/:id", (request, response) => {
  const id = request.params.id;
  const { name, address, email, phoneNumber } = request.body;

  const sql = `
    UPDATE Customer SET Name = ?, Addr = ?, Email = ?, Ph_No = ?
    WHERE Id = ?
  `;

  query.queryDatabaseWithParams(sql, [name, address, email, phoneNumber, id], response);
});

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

app.delete("/api/bank/:id", (request, response) => {
  const id = request.params.id;

  const sql = `
    DELETE FROM Bank
    WHERE Code = ?
  `;

  query.queryDatabaseWithParams(sql, [id], response);
});

app.delete("/api/manager/:id", (request, response) => {
  const id = request.params.id;

  const sql = `
    DELETE FROM Loan_Officer
    WHERE Id = ?
  `;

  query.queryDatabaseWithParams(sql, [id], response);
});

app.delete("/api/branch/:id", (request, response) => {
  const id = request.params.id;

  const sql = `
    DELETE FROM Branch
    WHERE Id = ?
  `;

  query.queryDatabaseWithParams(sql, [id], response);
});

app.delete("/api/customer/:id", (request, response) => {
  const id = request.params.id;

  const sql = `
    DELETE FROM Customer
    WHERE Id = ?
  `;

  query.queryDatabaseWithParams(sql, [id], response);
});

app.delete("/api/payment/:id", (request, response) => {
  const id = request.params.id;

  const sql = `
    DELETE FROM Payment
    WHERE Id = ?
  `;

  query.queryDatabaseWithParams(sql, [id], response);
});

app.delete("/api/loan/:id", (request, response) => {
  const id = request.params.id;

  const sql = `
    DELETE FROM Loan
    WHERE Id = ?
  `;

  query.queryDatabaseWithParams(sql, [id], response);
});

app.listen(5000, () => {
  console.log("Server running!");
});
