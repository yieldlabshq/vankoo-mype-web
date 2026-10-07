/**
 * Wire shape of `POST /invoices`.
 *
 * The backend answers with only the new id today — everything else about the invoice
 * is read back later, from the endpoints that list and detail it, which do not exist
 * on this frontend yet.
 */
export interface InvoiceResource {
    invoiceId: string;
}
