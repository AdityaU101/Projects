/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import axios from "axios";
import { useEffect, useState } from "react";
import { getLoan, getLoanData, getPaymentData } from "../utils/api";
import { mappedIds } from "../utils/map";
import Select from "./Reusable/Select";
import ReusableTable from "./Reusable/Table";
import Wrapper from "./Wrapper";
import { calculateInterestAndTotalAmount, calculateMinimumInterest, calculateMonthlyPayment, formatToINR } from "../utils/utils";
import ReusableForm from "./Reusable/Form";

const Payment = () => {
  const [data, setData] = useState<[] | null>([]);
  const [loanId, setLoanId] = useState<[]>([]);
  const [loan, setLoan] = useState(null);
  const [amountToBePaid, setAmountToBePaid] = useState<string | number>(0);
  const [selectedLoanId, setSelectedLoanId] = useState("");

  const fields = [{ name: "method", label: "Method of Payment" }];

  const columns = [
    { field: "id", header: "Id" },
    { field: "amount", header: "Amount" },
    { field: "method", header: "Method" },
    { field: "loanId", header: "Loan Id" },
    { field: "date", header: "Payment Date" },
  ];

  const onSubmit = async (data: { method: string }) => {
    const object = { ...data, loanId: selectedLoanId, amount: amountToBePaid };
    try {
      await axios.post("http://localhost:5000/api/payment", object);
      setData(await getPaymentData());
      await fetchLoan(selectedLoanId);
    } catch (error) {
      console.error(error);
    }
  };

  const fetch = async () => {
    setData(await getPaymentData());
    const data = await getLoanData();
    const filtered = data.filter((element) => element.status === "Approved");
    setLoanId(mappedIds(filtered));
  };

  const fetchLoan = async (id: string) => {
    setLoan(await getLoan(id));
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedLoanId) {
      setLoan(null);
      return;
    }

    fetchLoan(selectedLoanId);
  }, [selectedLoanId]);

  useEffect(() => {
    if (!loan) return;

    const { borrowed, interestRate, term, repaid } = loan;
    const monthly = calculateMonthlyPayment(+borrowed, +interestRate, +term);
    const { totalAmount } = calculateInterestAndTotalAmount(borrowed, interestRate, term);
    setAmountToBePaid(calculateMinimumInterest(repaid, monthly, totalAmount));
  }, [loan]);

  if (!data) return;

  return (
    <Wrapper classes="flex flex-col h-full gap-4">
      <ReusableForm entityType="payment" fields={fields} onSubmit={onSubmit} title="Make a payment">
        <Select label="Loan Id" data={loanId} dataNotFoundMessage="No loans found" setSelected={setSelectedLoanId} type="loan" />
        <div className="flex items-center">
          <label className="form-label">Amount to be Paid</label>
          <input
            value={typeof amountToBePaid === "number" ? (amountToBePaid === 0 ? "Select a loan to calculate amount" : formatToINR(amountToBePaid)) : amountToBePaid}
            disabled={true}
            className="form-input-box"
          />
        </div>
      </ReusableForm>
      <ReusableTable entityType="payment" canEdit={false} columns={columns} rows={data} />
    </Wrapper>
  );
};

export default Payment;
