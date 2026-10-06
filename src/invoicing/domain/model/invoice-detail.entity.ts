import {railStateFor, type InvoiceStatus, type RailState} from './invoice-status';
import type {InvoiceAmount} from './invoice.entity';

/** One line of "Detalle de la factura". */
export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: InvoiceAmount;
    subtotal: InvoiceAmount;
}

/** The tax breakdown under the line items. */
export interface InvoiceTotals {
    subtotal: InvoiceAmount;
    igv: InvoiceAmount;
    commercialDiscount: InvoiceAmount;
    total: InvoiceAmount;
}

/** Attributes an invoice detail is built from. */
export interface InvoiceDetailAttributes {
    id: string;
    /** The fiscal number, e.g. F001-1283. Null until the OCR has read it. */
    number: string | null;
    status: InvoiceStatus;
    issuerName: string | null;
    issuerRuc: string | null;
    payerName: string | null;
    payerRuc: string | null;
    issuedAt: Date | null;
    dueDate: Date | null;
    /** Null until the OCR has read it: a currency nobody read is not PEN by default. */
    currency: string | null;
    fiscalNumber: string | null;
    lineItems: readonly InvoiceLineItem[];
    /** Null until the service has an amount. S/ 0.00 would be a figure nobody measured. */
    totals: InvoiceTotals | null;
    /**
     * The backend's own explanation of why this invoice needs a person, worded for
     * `InlineAlert`. Set while `status` is `REQUIRES_REVIEW` or `NOT_ELIGIBLE`; null
     * otherwise.
     */
    alertMessage: string | null;
}

/**
 * The full record behind one invoice — `MK · Detalle de factura` and its
 * `Requiere revisión` variant, as `GET /invoices/{id}` answers it.
 *
 * Every field the OCR fills in is optional: an invoice that was only uploaded, or
 * whose read failed, has an id and a status and nothing else, and the screen has to
 * render that without inventing a date.
 */
export class InvoiceDetail {
    readonly id: string;
    readonly number: string | null;
    readonly status: InvoiceStatus;
    readonly issuerName: string | null;
    readonly issuerRuc: string | null;
    readonly payerName: string | null;
    readonly payerRuc: string | null;
    readonly issuedAt: Date | null;
    readonly dueDate: Date | null;
    readonly currency: string | null;
    readonly fiscalNumber: string | null;
    readonly lineItems: readonly InvoiceLineItem[];
    readonly totals: InvoiceTotals | null;
    readonly alertMessage: string | null;

    constructor({
        id,
        number,
        status,
        issuerName,
        issuerRuc,
        payerName,
        payerRuc,
        issuedAt,
        dueDate,
        currency,
        fiscalNumber,
        lineItems,
        totals,
        alertMessage
    }: InvoiceDetailAttributes) {
        this.id = id;
        this.number = number;
        this.status = status;
        this.issuerName = issuerName;
        this.issuerRuc = issuerRuc;
        this.payerName = payerName;
        this.payerRuc = payerRuc;
        this.issuedAt = issuedAt;
        this.dueDate = dueDate;
        this.currency = currency;
        this.fiscalNumber = fiscalNumber;
        this.lineItems = lineItems;
        this.totals = totals;
        this.alertMessage = alertMessage;
    }

    /** Where `status` places this invoice on the rail, or null off it (`REJECTED`). */
    railState(): RailState | null {
        return railStateFor(this.status);
    }
}
