/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import axios from "axios";
import { useState, useEffect } from "react";
import { mappedIds } from "../utils/map";
import ReusableForm from "./Reusable/Form";
import ReusableTable from "./Reusable/Table";
import Wrapper from "./Wrapper";
import Select from "./Reusable/Select";
import { getBankData, getBranchData } from "../utils/api";

export const Branch = () => {
  const [data, setData] = useState<[] | null>(null);
  const [bankCodes, setBankCodes] = useState<[]>();
  const [selectedBankCode, setSelectedBankCode] = useState("");

  const fields = [
    { name: "name", label: "Name" },
    { name: "location", label: "Location" },
  ];

  const columns = [
    { header: "Id", field: "id" },
    { header: "Name", field: "name" },
    { header: "Location", field: "location" },
    { header: "Bank Code", field: "bankCode" },
  ];

  const onSubmit = async (data: { name: string; location: string }) => {
    const object = { ...data, bankCode: selectedBankCode };
    try {
      await axios.post("http://localhost:5000/api/branch", object);
      setData(await getBranchData());
    } catch (error) {
      console.error(error);
    }
  };

  const fetch = async () => {
    setData(await getBranchData());
    setBankCodes(mappedIds(await getBankData()));
  };

  useEffect(() => {
    fetch();
  }, []);

  if (data === null) return;

  return (
    <Wrapper classes="flex flex-col h-full gap-4">
      <ReusableForm entityType="branch" fields={fields} onSubmit={onSubmit} title="Add a branch">
        <Select label="Bank Code" data={bankCodes} dataNotFoundMessage="No banks found" setSelected={setSelectedBankCode} type="bank" />
      </ReusableForm>
      <ReusableTable entityType="branch" columns={columns} rows={data} />
    </Wrapper>
  );
};
