/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Status from "./Status";
import { getLoan, getPaymentDataForLoan } from "../utils/api";
import Wrapper from "./Wrapper";
import ReusableTable from "./Reusable/Table";

const LoanSummary = () => {
  const { id } = useParams();
  const [loanData, setLoanData] = useState(null);
  const [payments, setPayments] = useState([]);

  const columns = [
    { field: "id", header: "Id" },
    { field: "amount", header: "Amount" },
    { field: "method", header: "Method" },
    { field: "date", header: "Payment Date" },
  ];

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoanData(await getLoan(id!));
        setPayments(await getPaymentDataForLoan(id!));
      } catch (error) {
        console.error("Error fetching loan details:", error);
      }
    };

    fetchLoanDetails();
  }, [id]);

  console.log(payments);
  if (!loanData) return null;

  return (
    <>
      <div className="-m-6 mb-6 border-b border-gray-300 bg-white py-4">
        <div className="mx-auto px-8">
          <h2 className="text-2xl font-bold">Loan Summary</h2>
        </div>
      </div>
      <Wrapper classes="max-w-[800px] flex flex-col gap-6">
        <div className="box">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-2xl font-bold">#{id}</h2>
            <Status status={loanData.status} />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Essentials</h3>
          <div className="mb-6">
            <div className="flex flex-col justify-between md:flex-row">
              <span>Amount Borrowed</span>
              <span className="text-xl font-bold">{loanData.borrowed}</span>
            </div>
            {(loanData.status === "Approved" || loanData.status === "Paid") && (
              <div className="flex flex-col justify-between md:flex-row">
                <span>Amount Repaid</span>
                <span className="text-xl font-bold">{loanData.amountRepaid}</span>
              </div>
            )}
            <div className="flex flex-col justify-between md:flex-row">
              <span>Duration</span>
              <span className="text-xl font-bold">{loanData.term}</span>
            </div>
            <div className="flex flex-col justify-between md:flex-row">
              <span>Interest Rate</span>
              <span className="text-xl font-bold">{loanData.interestRate}</span>
            </div>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Customer Details</h3>
          <div className="mb-6">
            <div className="flex flex-col justify-between md:flex-row">
              <span>Id</span>
              <span className="text-xl font-bold">#{loanData.customerId}</span>
            </div>
            <div className="flex flex-col justify-between md:flex-row">
              <span>Name</span>
              <span className="text-xl font-bold">{loanData.customerName}</span>
            </div>
            <div className="flex flex-col justify-between md:flex-row">
              <span>Address</span>
              <span className="text-xl font-bold">{loanData.customerAddr}</span>
            </div>
            <div className="flex flex-col justify-between md:flex-row">
              <span>Email</span>
              <span className="text-xl font-bold">{loanData.customerEmail}</span>
            </div>
          </div>
        </div>
        <ReusableTable columns={columns} canEdit={false} entityType="payment" rows={payments} />
      </Wrapper>
    </>
  );
};

export default LoanSummary;
