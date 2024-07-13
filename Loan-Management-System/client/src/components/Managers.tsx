/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import axios from "axios";
import { useState, useEffect } from "react";
import { mappedBranchData, mappedManagerData } from "../utils/map";
import ReusableForm from "./Reusable/Form";
import ReusableTable from "./Reusable/Table";
import Wrapper from "./Wrapper";

export const Managers = () => {
  const [data, setData] = useState<[] | null>(null);
  const [branchCodes, setBranchCodes] = useState<[]>();
  const [selectedBranchCode, setSelectedBranchCode] = useState("");

  const fields = [
    { name: "name", label: "Name" },
    { name: "email", label: "Email", type: "email" },
    { name: "phoneNumber", label: "Phone Number" },
  ];

  const columns = [
    { header: "Id", field: "id" },
    { header: "Name", field: "name" },
    { header: "Email", field: "email" },
    { header: "Phone Number", field: "phoneNumber" },
    { header: "Branch Id", field: "branchId" },
  ];

  const onSubmit = async (data: { name: string; email: string; phoneNumber: string }) => {
    const object = { ...data, branchId: selectedBranchCode };
    try {
      await axios.post("http://localhost:5000/api/manager", object);
      getData();
    } catch (error) {
      console.error(error);
    }
  };

  const getData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/manager");
      setData(mappedManagerData(response.data));
    } catch (error) {
      console.error(error);
    }
  };

  const getBranchCodes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/branch");
      const mapped = mappedBranchData(response.data);
      setBranchCodes(mapped.map((element) => element.id));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getData();
    getBranchCodes();
  }, []);

  if (data === null) return;

  return (
    <Wrapper classes="flex flex-col h-full gap-4">
      <ReusableForm entityType="manager" fields={fields} onSubmit={onSubmit} title="Add a manager">
        <div className="flex items-center">
          <label className="form-label" htmlFor={"bank"}>
            Branch Code
          </label>
          {branchCodes ? (
            <select className="form-input-box" onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSelectedBranchCode(event.target.value)}>
              <option value={""}>Select a branch code</option>
              {branchCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          ) : (
            <p className="">No banks available</p>
          )}
        </div>
      </ReusableForm>
      <ReusableTable entityType="manager" columns={columns} rows={data} />
    </Wrapper>
  );
};
