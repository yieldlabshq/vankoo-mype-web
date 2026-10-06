/**
 * Wire shape of one row from `GET /invoices`.
 *
 * Provisional — see `Invoice`'s own note: this endpoint does not exist on the
 * backend yet.
 */
export interface InvoiceListItemResource {
    id: string;
    number: string;
    payerName: string;
    payerRuc: string;
    dueDate: string;
    status: string;
    amount: {value: number; currency: string};
}
