import type {InvoiceAmount} from '../../../invoicing/domain/model/invoice.entity';
import type {RiskGrade} from './auction-status';

/** The values a quote's `status` can hold — Investment's `QuoteStatus`. */
export type FinancialQuoteStatus = 'ACTIVE' | 'ACCEPTED' | 'SUPERSEDED' | 'EXPIRED';

/** Attributes a financial quote is built from. */
export interface FinancialQuoteAttributes {
    id: string;
    status: FinancialQuoteStatus;
    riskGrade: RiskGrade;
    /** How long the investors' money is out, in days: from publication to the due date. */
    termDays: number;
    /** The invoice's amount, as far as the platform is willing to fund it. */
    fundableAmount: InvoiceAmount;
    /** What the investors put in — the fundable amount minus their return. */
    fundingTarget: InvoiceAmount;
    /** Vankoo's fee for the term, IGV included. */
    platformFeeTotal: InvoiceAmount;
    /** What lands in the MYPE's wallet: the funding target minus the fee. */
    mypeAdvance: InvoiceAmount;
    /** The MYPE's total cost as an annual effective rate, in percentage points. */
    mypeTceaPct: number;
    validUntil: Date;
}

/** The discount line of the offer: how much of the invoice the investors keep. */
export interface QuoteDiscount {
    amount: InvoiceAmount;
    /** Of the fundable amount, in percentage points. */
    percentage: number;
}

/**
 * What Vankoo offers the MYPE for one invoice — a `FinancialQuoteResource`, reduced
 * to the figures the offer panel prints.
 *
 * A quote is a snapshot: Investment prices it once, gives it 24 hours, and a new one
 * supersedes it rather than changing it. So the entity is immutable and carries only
 * what the screen shows; the rate breakdown the backend also sends stays on the wire
 * until a screen needs it.
 */
export class FinancialQuote {
    readonly id: string;
    readonly status: FinancialQuoteStatus;
    readonly riskGrade: RiskGrade;
    readonly termDays: number;
    readonly fundableAmount: InvoiceAmount;
    readonly fundingTarget: InvoiceAmount;
    readonly platformFeeTotal: InvoiceAmount;
    readonly mypeAdvance: InvoiceAmount;
    readonly mypeTceaPct: number;
    readonly validUntil: Date;

    constructor({
        id,
        status,
        riskGrade,
        termDays,
        fundableAmount,
        fundingTarget,
        platformFeeTotal,
        mypeAdvance,
        mypeTceaPct,
        validUntil
    }: FinancialQuoteAttributes) {
        this.id = id;
        this.status = status;
        this.riskGrade = riskGrade;
        this.termDays = termDays;
        this.fundableAmount = fundableAmount;
        this.fundingTarget = fundingTarget;
        this.platformFeeTotal = platformFeeTotal;
        this.mypeAdvance = mypeAdvance;
        this.mypeTceaPct = mypeTceaPct;
        this.validUntil = validUntil;
    }

    /**
     * The investors' return, shown to the MYPE as a discount on the invoice.
     *
     * Investment does not send it as such — it sends the fundable amount and the
     * funding target, and the gap between them is what the investors earn. The panel
     * needs it as a line and as a percentage, so both are computed here, once.
     */
    discount(): QuoteDiscount {
        const value = this.fundableAmount.value - this.fundingTarget.value;
        const percentage = this.fundableAmount.value === 0 ? 0 : (value / this.fundableAmount.value) * 100;
        return {amount: {value, currency: this.fundableAmount.currency}, percentage};
    }

    /** Whether the 24-hour window has closed by `now`, so accepting would be refused. */
    isExpiredAt(now: Date): boolean {
        return this.validUntil.getTime() <= now.getTime();
    }
}
