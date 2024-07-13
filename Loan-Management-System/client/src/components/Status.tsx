const Status = ({ status }: { status: string }) => {
  const classes = "rounded border text-sm px-4 py-0.5 font-medium";

  switch (status) {
    case "Paid":
      return <span className={`${classes} border-green-400 bg-green-200 text-green-800`}>{status}</span>;
    case "Pending":
      return <span className={`${classes} border-yellow-400 bg-yellow-200 text-yellow-800`}>{status} Approval</span>;
    case "Approved":
      return <span className={`${classes} border-orange-400 bg-orange-200 text-orange-800`}>{status}</span>;
    case "Rejected":
      return <span className={`${classes} border-red-400 bg-red-200 text-red-800`}>{status}</span>;
  }
};

export default Status;
