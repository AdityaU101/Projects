/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatToINR, formatToLocaleDateString } from "./utils";

export const mappedDashboardStats = (data: {
  total_customers: any;
  total_loans: any;
  pending_loans: any;
  approved_loans: any;
  rejected_loans: any;
  paid_loans: any;
  total_loan_amount: any;
  total_repayments: any;
  interest_collected: any;
}) => {
  return {
    totalCustomers: data.total_customers,
    totalLoans: data.total_loans,
    pendingLoans: data.pending_loans,
    approvedLoans: data.approved_loans,
    rejectedLoans: data.rejected_loans,
    paidLoans: data.paid_loans,
    totalLoanAmount: data.total_loan_amount,
    totalRepayments: data.total_repayments,
    interestCollected: data.interest_collected,
  };
};

export const mappedBankData = (data: { Addr: any; Code: any; Estd_Date: any; Name: any }[]) => {
  return data.map(({ Addr, Code, Estd_Date, Name }) => ({
    id: Code,
    name: Name,
    estd: formatToLocaleDateString(Estd_Date),
    address: Addr,
  }));
};

export const mappedManagerData = (data: { Id: any; Name: any; Email: any; Phone_number: any; Branch_id: any }[]) => {
  return data.map(({ Id, Name, Email, Phone_number, Branch_id }) => ({
    id: Id,
    name: Name,
    email: Email,
    phoneNumber: Phone_number,
    branchId: Branch_id,
  }));
};

export const mappedBranchData = (data: { Id: any; Name: any; Location: any; Code: any }[]) => {
  return data.map(({ Id, Name, Location, Code }) => ({
    id: Id,
    name: Name,
    location: Location,
    bankCode: Code,
  }));
};

export const mappedCustomerData = (data: { Id: any; Name: any; Addr: any; Email: any; Ph_No: any }[]) => {
  return data.map(({ Id, Name, Addr, Email, Ph_No }) => ({
    id: Id,
    name: Name,
    email: Email,
    phoneNumber: Ph_No,
    address: Addr,
  }));
};

export const mappedLoanData = (
  data: { Id: any; Amount: any; Status: any; Customer_id: any; Interest_rate: any; Amount_repaid: any; Term: any; Issue_date: any; Branch_id: any }[]
) => {
  return data.map(({ Id, Amount, Status, Customer_id, Interest_rate, Amount_repaid, Term, Issue_date, Branch_id }) => ({
    id: Id,
    borrowed: formatToINR(Amount),
    repaid: formatToINR(Amount_repaid),
    interestRate: `${Interest_rate}%`,
    term: `${Term} Months`,
    status: Status,
    issueDate: formatToLocaleDateString(Issue_date),
    branchId: Branch_id,
    customerId: Customer_id,
  }));
};

export const mappedLoan = (data: { [x: string]: any }) => {
  return {
    loanId: data["Id"],
    borrowed: formatToINR(data["Amount"]),
    interestRate: `${data["Interest_rate"]}%`,
    term: `${data["Term"]} Months`,
    issueDate: new Date(data["Issue_date"]).toLocaleDateString(),
    branchId: data["Branch_id"],
    customerId: data["Customer_id"],
    customerName: data["Name"],
    customerAddr: data["Addr"],
    customerEmail: data["Email"],
    customerPhNo: data["Ph_No"],
    amountRepaid: formatToINR(data["Amount_repaid"]),
    status: data["Status"],
  };
};

export const mappedPaymentData = (data: { Id: any; Amount: any; Date: any; Method: any; Loan_id: any }[]) => {
  return data.map(({ Id, Amount, Date, Method, Loan_id }) => ({
    id: Id,
    amount: formatToINR(Amount),
    date: formatToLocaleDateString(Date),
    method: Method,
    loanId: Loan_id,
  }));
};

export const mappedIds = (data: any[]) => {
  return data.map((element: { id: any }) => element?.id);
};
