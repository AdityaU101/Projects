/// <reference types="vite/client" />

interface DashboardData {
  totalCustomers: number;
  totalLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  paidLoans: number;
  totalLoanAmount: number;
  totalRepayments: number;
}

interface NotificationData {
  label: string;
  message: string;
  icon: string;
  sentiment: "positive" | "neutral" | "negative";
}
