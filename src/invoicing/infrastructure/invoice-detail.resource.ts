/**
 * Wire shape of `GET /invoices/{id}`, mirroring the service's `InvoiceDetailsResponse`.
 *
 * Everything the OCR fills in is nullable: an invoice that has only been uploaded, or
 * whose read failed, answers with the identity fields and nothing else. Amounts are
 * plain decimals in the invoice's currency, not `{value, currency}` pairs.
 */
export interface InvoiceDetailResource {
    invoiceId: string;
    mypeId: string;
    status: string;
    sunatVerificationStatus: string;
    consistencyStatus: string;
    eligibleForFunding: boolean;
    integrationEventStatus: string;
    fiscalInvoiceNumber: string | null;
    issuerRuc: string | null;
    issuerName: string | null;
    issuerTradeName: string | null;
    payerRuc: string | null;
    payerName: string | null;
    issueDate: string | null;
    dueDate: string | null;
    currency: string | null;
    subtotal: number | null;
    tax: number | null;
    discount: number | null;
    total: number | null;
    items: readonly {
        description: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }[];
    validationIssues: readonly {
        code: string;
        message: string;
        severity: string;
    }[];
}
