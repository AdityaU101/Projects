function formatToINR(amount: string | number): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return formatter.format(+amount);
}

function calculateInterestAndTotalAmount(
  principal: number,
  interestRate: number,
  duration: number
): {
  interestAmount: number;
  totalAmount: number;
} {
  const interest = principal * (interestRate / 100) * (duration / 12);
  const totalAmount = principal + interest;
  return {
    interestAmount: interest,
    totalAmount: totalAmount,
  };
}

function calculateMonthlyPayment(principal: number, annualInterestRate: number, loanTerm: number) {
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTerm;
  const monthlyPayment = (principal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));

  return monthlyPayment;
}

function calculateMinimumInterest(repaid: number, monthlyPayment: number, totalAmount: number) {
  return Math.min(monthlyPayment, totalAmount - repaid);
}

function formatToLocaleDateString(date: string): string {
  return new Date(date).toLocaleDateString();
}

function capitalizeWord(word: string): string {
  return word.replace(word[0], word[0].toUpperCase());
}

export { formatToINR, calculateInterestAndTotalAmount, calculateMinimumInterest, formatToLocaleDateString, calculateMonthlyPayment, capitalizeWord };
