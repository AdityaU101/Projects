/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useState } from "react";
import ReusableForm from "./Reusable/Form";
import ReusableTable from "./Reusable/Table";
import Wrapper from "./Wrapper";
import axios from "axios";
import { getCustomerData } from "../utils/api";

export const Customers = () => {
  const [data, setData] = useState<[] | null>([]);

  const fields = [
    { name: "name", label: "Name" },
    { name: "email", label: "Email", type: "email" },
    { name: "address", label: "Address" },
    { name: "phoneNumber", label: "Phone Number" },
  ];

  const columns = [
    { header: "Id", field: "id" },
    { header: "Name", field: "name" },
    { header: "Email", field: "email" },
    { header: "Phone Number", field: "phoneNumber" },
    { header: "Address", field: "address" },
  ];

  const onSubmit = async (data: { name: string; address: string; email: string; phoneNumber: string }) => {
    try {
      await axios.post("http://localhost:5000/api/customer", data);
      setData(await getCustomerData());
    } catch (error) {
      console.error(error);
    }
  };
  const fetch = async () => {
    setData(await getCustomerData());
  };

  useEffect(() => {
    fetch();
  }, []);

  if (!data) return;

  return (
    <Wrapper classes="flex flex-col h-full gap-4">
      <ReusableForm entityType="customer" fields={fields} onSubmit={onSubmit} title="Add a customer" />
      <ReusableTable entityType="customer" columns={columns} rows={data} />
    </Wrapper>
  );
};
