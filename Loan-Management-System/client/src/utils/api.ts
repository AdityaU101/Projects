import axios from "axios";
import { mappedBranchData, mappedBankData, mappedManagerData, mappedCustomerData, mappedLoanData, mappedLoan, mappedPaymentData, mappedDashboardStats } from "./map";

export const getDashboardData = async (): Promise<DashboardData | undefined> => {
  try {
    const response = await axios.get("http://localhost:5000/api/dashboard");
    return mappedDashboardStats(response.data[0]);
  } catch (error) {
    console.error(error);
  }
};

export const getBankData = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/bank");
    return mappedBankData(response.data);
  } catch (error) {
    console.error(error);
  }
};

export const getLoanData = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/loan");
    return mappedLoanData(response.data);
  } catch (error) {
    console.error(error);
  }
};

export const getLoan = async (id: string) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/loan/${id}`);
    return mappedLoan(response.data[0]);
  } catch (error) {
    console.error(error);
  }
};

export const getBranchData = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/branch");
    return mappedBranchData(response.data);
  } catch (error) {
    console.error(error);
  }
};

export const getCustomerData = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/customer");
    return mappedCustomerData(response.data);
  } catch (error) {
    console.error(error);
  }
};

export const getManagerData = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/manager");
    return mappedManagerData(response.data);
  } catch (error) {
    console.error(error);
  }
};

export const getPaymentData = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/payment");
    return mappedPaymentData(response.data);
  } catch (error) {
    console.error(error);
  }
};

export const getPaymentDataForLoan = async (id: string) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/payment/${id}`);
    return mappedPaymentData(response.data);
  } catch (error) {
    console.error(error);
  }
};

export const approveLoan = async (id: number, status: "Rejected" | "Approved") => {
  try {
    await axios.put(`http://localhost:5000/api/loan/${id}`, { status });
  } catch (error) {
    console.error(error);
  }
};

export const deleteEntity = async (id: number, entityType: "bank" | "branch" | "customer" | "manager" | "payment" | "loan") => {
  let response;
  switch (entityType) {
    case "bank":
      response = await axios.delete(`http://localhost:5000/api/bank/${id}`);
      break;
    case "branch":
      response = await axios.delete(`http://localhost:5000/api/branch/${id}`);
      break;
    case "customer":
      response = await axios.delete(`http://localhost:5000/api/customer/${id}`);
      break;
    case "manager":
      response = await axios.delete(`http://localhost:5000/api/manager/${id}`);
      break;
    default:
      console.error("Cannot determine entity type for deletion");
      return;
  }

  return response;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const editEntity = async (id: number, modifiedRow: any, entityType: "bank" | "branch" | "customer" | "manager" | "payment" | "loan") => {
  let response;
  switch (entityType) {
    case "bank":
      response = await axios.put(`http://localhost:5000/api/bank/${id}`, modifiedRow);
      break;
    case "branch":
      response = await axios.put(`http://localhost:5000/api/branch/${id}`, modifiedRow);
      break;
    case "customer":
      response = await axios.put(`http://localhost:5000/api/customer/${id}`, modifiedRow);
      break;
    case "manager":
      response = await axios.put(`http://localhost:5000/api/manager/${id}`, modifiedRow);
      break;
    default:
      console.error("Cannot determine entity type for saving");
      return;
  }

  return response;
};
