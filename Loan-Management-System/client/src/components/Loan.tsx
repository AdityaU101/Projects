/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import axios from "axios";
import { useState, useEffect } from "react";
import ReusableForm from "./Reusable/Form";
import Wrapper from "./Wrapper";
import Select from "./Reusable/Select";
import { getBranchData, getCustomerData, getLoanData } from "../utils/api";
import { mappedIds } from "../utils/map";
import Status from "./Status";
import { useNavigate } from "react-router-dom";

export const Loan = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<[] | null>([]);
  const [branchCodes, setBranchCodes] = useState<[]>([]);
  const [customerIds, setCustomerIds] = useState<[]>([]);
  const [selectedBranchCode, setSelectedBranchCode] = useState("");
  const [selectedCustomerCode, setSelectedCustomerCode] = useState("");

  const fields = [
    { name: "amount", label: "Amount", type: "number" },
    { name: "interestRate", label: "Interest Rate", type: "number" },
    { name: "term", label: "Duration (Months)", type: "number" },
  ];

  const onSubmit = async (data: { amount: string; interestRate: string; term: string }) => {
    const object = { ...data, branchCode: selectedBranchCode, customerCode: selectedCustomerCode };
    try {
      await axios.post("http://localhost:5000/api/loan", object);
      setData(await getLoanData());
    } catch (error) {
      console.error(error);
    }
  };

  const fetch = async () => {
    setData(await getLoanData());
    setBranchCodes(mappedIds(await getBranchData()));
    setCustomerIds(mappedIds(await getCustomerData()));
  };

  useEffect(() => {
    fetch();
  }, []);

  if (!data) return;

  return (
    <Wrapper classes="flex flex-col h-full gap-4">
      <ReusableForm entityType="loan" fields={fields} onSubmit={onSubmit} title="Borrow a Loan">
        <Select label="Branch Code" data={branchCodes} dataNotFoundMessage="No branches found" setSelected={setSelectedBranchCode} type="branch" />
        <Select label="Customer Id" data={customerIds} dataNotFoundMessage="No customers found" setSelected={setSelectedCustomerCode} type="customer" />
      </ReusableForm>
      <div className="grid grid-flow-row-dense grid-cols-3 gap-4 border border-gray-300 bg-white p-6">
        {data.map(({ id, borrowed, repaid, status, issueDate }) => (
          <div key={id} className="flex h-fit flex-col rounded border border-gray-300 bg-blue-50 pb-4">
            <div className="flex justify-between bg-blue-600 px-4 py-2 text-lg font-bold text-blue-50">
              <p>#{id}</p>
              <Status status={status} />
            </div>
            <div className="p-4 text-base">
              <div className="flex justify-between">
                <p>Borrowed</p>
                <p className="font-bold">{borrowed}</p>
              </div>
              <div className="flex justify-between">
                <p>Repaid</p>
                <p className="font-bold">{repaid}</p>
              </div>
              <div className="flex justify-between">
                <p>Issue Date</p>
                <p className="font-bold">{issueDate}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/loan/${id}`)}
              className="mr-4 flex items-center gap-2 self-end rounded bg-gray-600 px-4 py-1 font-bold text-gray-50 hover:bg-gray-400 hover:text-gray-900"
            >
              Details <i className="fa-solid fa-sm fa-chevron-right"></i>
            </button>
          </div>
        ))}
      </div>
    </Wrapper>
  );
};
