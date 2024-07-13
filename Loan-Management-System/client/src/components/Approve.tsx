/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { useEffect, useState } from "react";
import Wrapper from "./Wrapper";
import { getLoanData } from "../utils/api";

import ReusableTable from "./Reusable/Table";

const Approve = () => {
  const [data, setData] = useState();

  const columns = [
    { field: "id", header: "Loan Id" },
    { field: "customerId", header: "Customer Id" },
    { field: "borrowed", header: "Amount" },
    { field: "interestRate", header: "Interest Rate" },
    { field: "term", header: "Term" },
    { field: "issueDate", header: "Request Date" },
  ];

  const fetch = async () => {
    const data = await getLoanData();
    const filtered = data.filter((element: { status: string }) => element.status === "Pending");
    setData(filtered);
  };

  useEffect(() => {
    fetch();
  }, []);

  if (!data) return;

  return (
    <>
      <div className="-m-6 mb-6 border-b border-gray-300 bg-white py-4">
        <div className="mx-auto max-w-[1100px] px-8">
          <h2 className="text-2xl font-bold">Approve Loans</h2>
        </div>
      </div>
      <Wrapper classes="size-full">
        <ReusableTable entityType="loan" isLoanApproval={true} canEdit={false} columns={columns} rows={data} />
      </Wrapper>
    </>
  );
};

export default Approve;
