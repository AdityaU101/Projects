/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import axios from "axios";
import ReusableForm from "./Reusable/Form";
import ReusableTable from "./Reusable/Table";
import Wrapper from "./Wrapper";
import { useEffect, useState } from "react";
import { getBankData } from "../utils/api";

export const Bank = () => {
  const [data, setData] = useState<[] | null>(null);
  const fields = [
    { name: "name", label: "Name" },
    { name: "address", label: "Address" },
    { name: "estd", label: "Estd. Date", type: "date" },
  ];

  const columns = [
    { header: "Code", field: "id" },
    { header: "Name", field: "name" },
    { header: "Address", field: "address" },
    { header: "Estd. Date", field: "estd" },
  ];

  const onSubmit = async (data: { name: string; address: string; estd: string }) => {
    try {
      await axios.post("http://localhost:5000/api/bank", data);
      setData(await getBankData());
    } catch (error) {
      console.error(error);
    }
  };

  const fetch = async () => {
    setData(await getBankData());
  };

  useEffect(() => {
    fetch();
  }, []);

  if (data === null) return;

  return (
    <Wrapper classes="flex flex-col h-full gap-4">
      <ReusableForm entityType="bank" fields={fields} onSubmit={onSubmit} title="Add a bank" />
      <ReusableTable entityType="bank" columns={columns} rows={data} />
    </Wrapper>
  );
};
