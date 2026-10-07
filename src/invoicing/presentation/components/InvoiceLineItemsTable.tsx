import {useTranslation} from 'react-i18next';
import type {InvoiceLineItem, InvoiceTotals} from '../../domain/model/invoice-detail.entity';
import {formatInvoiceAmount} from '../../domain/model/invoice.entity';

interface InvoiceLineItemsTableProps {
    lineItems: readonly InvoiceLineItem[];
    totals: InvoiceTotals;
}

/** "Detalle de la factura": what SUNAT's own line items say, and the tax breakdown under them. */
export function InvoiceLineItemsTable({lineItems, totals}: InvoiceLineItemsTableProps) {
    const {t} = useTranslation();

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="border-border-subtle w-full overflow-x-auto rounded-lg border">
                <div className="min-w-[560px]">
                    <div className="text-caption text-fg-muted flex gap-4 px-4 py-3 font-semibold">
                        <p className="min-w-0 flex-1">{t('invoicing.detail.lineItems.description')}</p>
                        <p className="w-[110px] shrink-0 text-right">{t('invoicing.detail.lineItems.quantity')}</p>
                        <p className="w-[150px] shrink-0 text-right">{t('invoicing.detail.lineItems.unitPrice')}</p>
                        <p className="w-[150px] shrink-0 text-right">{t('invoicing.detail.lineItems.subtotal')}</p>
                    </div>
                    {lineItems.map((item, index) => (
                        <div key={index} className="border-border-subtle flex gap-4 border-t p-4">
                            <p className="text-body text-fg min-w-0 flex-1">{item.description}</p>
                            <p className="text-body text-fg w-[110px] shrink-0 text-right font-semibold">{item.quantity}</p>
                            <p className="text-body text-fg w-[150px] shrink-0 text-right font-semibold">
                                {formatInvoiceAmount(item.unitPrice)}
                            </p>
                            <p className="text-body text-fg w-[150px] shrink-0 text-right font-semibold">
                                {formatInvoiceAmount(item.subtotal)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex w-full flex-col gap-2">
                <div className="flex items-center justify-between">
                    <p className="text-caption text-fg-muted">{t('invoicing.detail.totals.subtotal')}</p>
                    <p className="text-body text-fg font-semibold">{formatInvoiceAmount(totals.subtotal)}</p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-caption text-fg-muted">{t('invoicing.detail.totals.igv')}</p>
                    <p className="text-body text-fg font-semibold">{formatInvoiceAmount(totals.igv)}</p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-caption text-fg-muted">{t('invoicing.detail.totals.commercialDiscount')}</p>
                    <p className="text-body text-fg font-semibold">− {formatInvoiceAmount(totals.commercialDiscount)}</p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-body text-fg font-semibold">{t('invoicing.detail.totals.total')}</p>
                    <p className="text-body text-fg font-medium">{formatInvoiceAmount(totals.total)}</p>
                </div>
            </div>
        </div>
    );
}
