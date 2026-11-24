import type { BuyVsRentInputs, BuyVsRentResult, YearlyBreakdown } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function calculateMonthlyMortgage(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;

  if (monthlyRate === 0) {
    return principal / numPayments;
  }

  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

function calculateYearAmortization(
  balance: number,
  annualRate: number,
  monthlyPayment: number
): { principalPaid: number; interestPaid: number; endBalance: number } {
  let principalPaid = 0;
  let interestPaid = 0;
  let currentBalance = balance;
  const monthlyRate = annualRate / 12;

  for (let month = 0; month < 12; month++) {
    if (currentBalance <= 0) break;

    const monthInterest = currentBalance * monthlyRate;
    const monthPrincipal = Math.min(monthlyPayment - monthInterest, currentBalance);

    interestPaid += monthInterest;
    principalPaid += monthPrincipal;
    currentBalance -= monthPrincipal;
  }

  return {
    principalPaid,
    interestPaid,
    endBalance: Math.max(0, currentBalance),
  };
}

export function calculateBuyVsRent(inputs: BuyVsRentInputs): BuyVsRentResult {
  const {
    currency,
    homePrice,
    downPaymentPercent,
    mortgageRate,
    mortgageTerm,
    propertyTaxRate,
    homeInsurance,
    hoaFees,
    maintenancePercent,
    closingCostsPercent,
    homeAppreciation,
    monthlyRent,
    rentIncrease,
    renterInsurance,
    stayDuration,
    investmentReturn,
    marginalTaxRate,
    includeTaxBenefits,
  } = inputs;

  const downPayment = homePrice * downPaymentPercent;
  const loanAmount = homePrice - downPayment;
  const closingCosts = homePrice * closingCostsPercent;
  const monthlyMortgage = calculateMonthlyMortgage(loanAmount, mortgageRate, mortgageTerm);

  const monthlyPropertyTax = (homePrice * propertyTaxRate) / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyHoa = hoaFees / 12;
  const monthlyMaintenance = (homePrice * maintenancePercent) / 12;
  const monthlyOwnershipCost =
    monthlyMortgage + monthlyPropertyTax + monthlyInsurance + monthlyHoa + monthlyMaintenance;

  const initialRent = monthlyRent;
  const monthlyRentCost = monthlyRent + renterInsurance / 12;

  const yearlyBreakdown: YearlyBreakdown[] = [];
  let mortgageBalance = loanAmount;
  let currentRent = monthlyRent;
  let currentHomeValue = homePrice;

  let cumulativeBuyCost = downPayment + closingCosts;
  let cumulativeRentCost = 0;

  let investmentValue = downPayment + closingCosts;

  let totalMortgageInterest = 0;
  let totalPropertyTax = 0;
  let totalInsurance = 0;
  let totalHoa = 0;
  let totalMaintenance = 0;
  let totalRent = 0;
  let totalRenterInsurance = 0;

  let breakEvenYear: number | null = null;

  for (let year = 1; year <= stayDuration; year++) {
    currentHomeValue *= 1 + homeAppreciation;

    const amort = calculateYearAmortization(mortgageBalance, mortgageRate, monthlyMortgage);
    mortgageBalance = amort.endBalance;

    const yearPropertyTax = currentHomeValue * propertyTaxRate;
    const yearInsurance = homeInsurance * Math.pow(1.02, year - 1);
    const yearHoa = hoaFees * Math.pow(1.03, year - 1);
    const yearMaintenance = currentHomeValue * maintenancePercent;
    const yearMortgagePayment = monthlyMortgage * 12;

    const taxSavings = includeTaxBenefits ? amort.interestPaid * marginalTaxRate : 0;

    const totalBuyingCost =
      yearMortgagePayment +
      yearPropertyTax +
      yearInsurance +
      yearHoa +
      yearMaintenance -
      taxSavings;

    const yearRent = currentRent * 12;
    const yearRenterInsurance = renterInsurance * Math.pow(1.02, year - 1);
    const totalRentingCost = yearRent + yearRenterInsurance;

    cumulativeBuyCost += totalBuyingCost;
    cumulativeRentCost += totalRentingCost;

    const monthlyBuyCost = totalBuyingCost / 12;
    const monthlyRentCostNow = totalRentingCost / 12;

    const monthlySavings = monthlyBuyCost - monthlyRentCostNow;
    if (monthlySavings > 0) {
      for (let m = 0; m < 12; m++) {
        investmentValue *= 1 + investmentReturn / 12;
        investmentValue += monthlySavings;
      }
    } else {
      investmentValue *= 1 + investmentReturn;
    }

    const homeEquity = currentHomeValue - mortgageBalance;

    const buyingNetWorth = homeEquity - (year < mortgageTerm ? 0 : 0);
    const rentingNetWorth = investmentValue;
    const buyAdvantage = buyingNetWorth - rentingNetWorth;

    if (breakEvenYear === null && buyAdvantage >= 0) {
      breakEvenYear = year;
    }

    totalMortgageInterest += amort.interestPaid;
    totalPropertyTax += yearPropertyTax;
    totalInsurance += yearInsurance;
    totalHoa += yearHoa;
    totalMaintenance += yearMaintenance;
    totalRent += yearRent;
    totalRenterInsurance += yearRenterInsurance;

    yearlyBreakdown.push({
      year,
      mortgagePayment: Math.round(yearMortgagePayment),
      principalPaid: Math.round(amort.principalPaid),
      interestPaid: Math.round(amort.interestPaid),
      propertyTax: Math.round(yearPropertyTax),
      insurance: Math.round(yearInsurance),
      hoa: Math.round(yearHoa),
      maintenance: Math.round(yearMaintenance),
      totalBuyingCost: Math.round(totalBuyingCost),
      homeValue: Math.round(currentHomeValue),
      remainingMortgage: Math.round(mortgageBalance),
      homeEquity: Math.round(homeEquity),
      taxSavings: Math.round(taxSavings),
      rentPayment: Math.round(yearRent),
      renterInsurance: Math.round(yearRenterInsurance),
      totalRentingCost: Math.round(totalRentingCost),
      investmentValue: Math.round(investmentValue),
      cumulativeBuyCost: Math.round(cumulativeBuyCost),
      cumulativeRentCost: Math.round(cumulativeRentCost),
      buyingNetWorth: Math.round(buyingNetWorth),
      rentingNetWorth: Math.round(rentingNetWorth),
      buyAdvantage: Math.round(buyAdvantage),
    });

    currentRent *= 1 + rentIncrease;
  }

  const finalYear = yearlyBreakdown[yearlyBreakdown.length - 1];
  const difference = finalYear.buyingNetWorth - finalYear.rentingNetWorth;
  const percentageDiff =
    finalYear.rentingNetWorth !== 0 ? (difference / Math.abs(finalYear.rentingNetWorth)) * 100 : 0;

  const finalComparison = {
    buyingNetWorth: finalYear.buyingNetWorth,
    rentingNetWorth: finalYear.rentingNetWorth,
    difference,
    winner:
      Math.abs(difference) < 5000
        ? ('tie' as const)
        : difference > 0
          ? ('buy' as const)
          : ('rent' as const),
    percentageDiff: Math.round(percentageDiff),
  };

  const getMilestone = (year: number) => {
    const data = yearlyBreakdown[year - 1];
    if (!data) return null;
    return {
      buyAdvantage: data.buyAdvantage,
      buyNetWorth: data.buyingNetWorth,
      rentNetWorth: data.rentingNetWorth,
    };
  };

  const milestones = {
    year5: getMilestone(5),
    year10: getMilestone(10),
    year15: getMilestone(15),
  };

  const totalCosts = {
    buying: {
      downPayment: Math.round(downPayment),
      closingCosts: Math.round(closingCosts),
      mortgageInterest: Math.round(totalMortgageInterest),
      propertyTax: Math.round(totalPropertyTax),
      insurance: Math.round(totalInsurance),
      hoa: Math.round(totalHoa),
      maintenance: Math.round(totalMaintenance),
      totalOutOfPocket: Math.round(cumulativeBuyCost),
    },
    renting: {
      totalRent: Math.round(totalRent),
      renterInsurance: Math.round(totalRenterInsurance),
      totalOutOfPocket: Math.round(cumulativeRentCost),
    },
  };

  const considerations: string[] = [];

  if (stayDuration < 5) {
    considerations.push('Short stay duration generally favors renting due to closing costs.');
  }
  if (homeAppreciation < 0.02) {
    considerations.push('Low home appreciation reduces the benefit of buying.');
  }
  if (monthlyOwnershipCost > monthlyRentCost * 1.5) {
    considerations.push('Monthly ownership costs are significantly higher than rent.');
  }
  if (investmentReturn > mortgageRate + 0.02) {
    considerations.push('Strong investment returns make renting and investing attractive.');
  }
  if (breakEvenYear && breakEvenYear > stayDuration) {
    considerations.push(`Break-even occurs after your planned ${stayDuration}-year stay.`);
  }

  const recommendation = {
    winner: finalComparison.winner === 'tie' ? ('rent' as const) : finalComparison.winner,
    reason:
      finalComparison.winner === 'buy'
        ? `Buying builds ${formatCurrencyByRegion(difference, currency)} more wealth over ${stayDuration} years.`
        : finalComparison.winner === 'rent'
          ? `Renting and investing builds ${formatCurrencyByRegion(Math.abs(difference), currency)} more wealth over ${stayDuration} years.`
          : 'Both options result in similar wealth outcomes.',
    considerations:
      considerations.length > 0
        ? considerations
        : ['Consider lifestyle factors, job stability, and personal preferences.'],
  };

  return {
    currency,
    downPayment: Math.round(downPayment),
    loanAmount: Math.round(loanAmount),
    monthlyMortgage: Math.round(monthlyMortgage),
    monthlyOwnershipCost: Math.round(monthlyOwnershipCost),
    closingCosts: Math.round(closingCosts),
    initialRent: Math.round(initialRent),
    monthlyRentCost: Math.round(monthlyRentCost),
    breakEvenYear,
    finalComparison,
    yearlyBreakdown,
    milestones,
    totalCosts,
    recommendation,
  };
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
