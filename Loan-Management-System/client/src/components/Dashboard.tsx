import { useEffect, useState } from "react";
import { getDashboardData } from "../utils/api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | undefined>(undefined);

  const fetch = async () => {
    setDashboardData(await getDashboardData());
  };

  useEffect(() => {
    fetch();
  }, []);

  if (dashboardData === undefined) return;
  const { totalCustomers, totalLoans, rejectedLoans, pendingLoans, approvedLoans, paidLoans, totalLoanAmount, totalRepayments } = dashboardData;

  return (
    <div className="dashboard-container">
      <div className="card">
        <h2>Total Customers</h2>
        <p>{totalCustomers}</p>
      </div>
      <div className="card">
        <h2>Total Amount Lent</h2>
        <p>${totalLoanAmount.toLocaleString()}</p>
      </div>
      <div className="card">
        <h2>Total Repayments</h2>
        <p>${totalRepayments.toLocaleString()}</p>
      </div>
      <div className="card">
        <h2>Total Loans</h2>
        <p>{totalLoans}</p>
      </div>
      <div className="card">
        <h2>Pending Loans</h2>
        <p>{pendingLoans}</p>
      </div>
      <div className="card">
        <h2>Approved Loans</h2>
        <p>{approvedLoans}</p>
      </div>
      <div className="card">
        <h2>Paid Loans</h2>
        <p>{paidLoans}</p>
      </div>
      <div className="card">
        <h2>Rejected Loans</h2>
        <p>{rejectedLoans}</p>
      </div>
    </div>
  );
};

export default Dashboard;
