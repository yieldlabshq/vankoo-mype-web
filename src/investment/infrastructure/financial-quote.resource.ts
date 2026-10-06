/**
 * Wire shape of a quote, mirroring Investment's `FinancialQuoteResource`.
 *
 * Amounts are plain decimals in `currency`; every `*Pct` field is already in
 * percentage points (the service multiplies its fractions by 100 before sending).
 * Instants are ISO-8601 strings.
 */
export interface FinancialQuoteResource {
    quoteId: string;
    status: string;
    pricingVersion: string;
    riskGrade: string;
    currency: string;
    termDays: number;
    fundableAmount: number;
    investorTeaPct: number;
    investorTermRatePct: number;
    fundingTarget: number;
    investorGrossProfit: number;
    platformMonthlyFeeRatePct: number;
    platformFeeBase: number;
    platformFeeTaxRatePct: number;
    platformFeeTax: number;
    platformFeeTotal: number;
    mypeAdvance: number;
    mypeTotalCost: number;
    mypeTceaPct: number;
    createdAt: string;
    validUntil: string;
    acceptedAt: string | null;
}
