import type {AxiosResponse} from 'axios';
import {InvoiceDetail} from '../domain/model/invoice-detail.entity';
import {isInvoiceStatus} from '../domain/model/invoice-status';
import {Invoice} from '../domain/model/invoice.entity';
import type {InvoiceDetailResource} from './invoice-detail.resource';
import type {InvoiceListItemResource} from './invoice-list.resource';
import type {InvoiceResource} from './invoice.resource';

/** Anti-corruption layer for the invoicing calls. */
export class InvoiceAssembler {
    /** The id of the invoice just created, or null when the call did not succeed. */
    static toInvoiceIdFromResponse(response: AxiosResponse<InvoiceResource>): string | null {
        if (response.status !== 200 && response.status !== 201) return null;
        return response.data.invoiceId;
    }

    /** One row of the invoice list, or null when its status is not one this build knows. */
    static toInvoiceFromListResource(resource: InvoiceListItemResource): Invoice | null {
        if (!isInvoiceStatus(resource.status)) return null;
        return new Invoice({
            id: resource.id,
            number: resource.number,
            payerName: resource.payerName,
            payerRuc: resource.payerRuc,
            dueDate: new Date(resource.dueDate),
            status: resource.status,
            amount: resource.amount
        });
    }

    /**
     * The rows of the invoice list.
     *
     * Tolerates both a bare array and an envelope keyed by the resource name, the
     * same as `BaseEndpoint.getAll()` does — a row whose status this build does not
     * recognise is dropped rather than shown wrong.
     */
    static toInvoicesFromResponse(
        response: AxiosResponse<InvoiceListItemResource[] | Record<string, InvoiceListItemResource[]>>
    ): Invoice[] {
        const body = response.data;
        const items = Array.isArray(body) ? body : Object.values(body).flat();
        return items
            .map(item => this.toInvoiceFromListResource(item))
            .filter((invoice): invoice is Invoice => invoice !== null);
    }

    /**
     * The full detail of one invoice, or null when its status is not one this build knows.
     *
     * The service sends amounts as plain decimals in one currency and leaves every
     * OCR-filled field null until the read succeeds; this is where both become the
     * `{value, currency}` pairs and the optional fields the entity carries.
     *
     * What the MYPE would receive is not here on purpose: that is the auction's
     * quote, which lives in Investment and is read through its own store.
     */
    static toInvoiceDetailFromResponse(response: AxiosResponse<InvoiceDetailResource>): InvoiceDetail | null {
        const resource = response.data;
        if (!isInvoiceStatus(resource.status)) return null;
        // The fallback only labels line items, which exist once the OCR has read the
        // invoice anyway; the currency the screen shows is the real one or nothing.
        const amountCurrency = resource.currency ?? DEFAULT_CURRENCY;
        const amount = (value: number | null) => ({value: value ?? 0, currency: amountCurrency});
        return new InvoiceDetail({
            id: resource.invoiceId,
            number: resource.fiscalInvoiceNumber,
            status: resource.status,
            issuerName: resource.issuerName ?? resource.issuerTradeName,
            issuerRuc: resource.issuerRuc,
            payerName: resource.payerName,
            payerRuc: resource.payerRuc,
            issuedAt: toDateOrNull(resource.issueDate),
            dueDate: toDateOrNull(resource.dueDate),
            currency: resource.currency,
            fiscalNumber: resource.fiscalInvoiceNumber,
            lineItems: resource.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: amount(item.unitPrice),
                subtotal: amount(item.subtotal)
            })),
            totals: resource.total === null
                ? null
                : {
                      subtotal: amount(resource.subtotal),
                      igv: amount(resource.tax),
                      commercialDiscount: amount(resource.discount),
                      total: amount(resource.total)
                  },
            // The service explains a review in its own words; the first issue is the
            // one worth a banner, and the view has copy of its own when there is none.
            alertMessage: resource.validationIssues[0]?.message ?? null
        });
    }
}

/** The product's currency, only to label line items the OCR read without one. */
const DEFAULT_CURRENCY = 'PEN';

/** A date from the wire, or null when the field is empty or does not parse. */
function toDateOrNull(value: string | null): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
