import {useTranslation} from 'react-i18next';
import {Link} from 'react-router';
import type {Invoice} from '../../domain/model/invoice.entity';
import {invoicingPaths} from '../invoicing-paths';
import {StatusPill} from './StatusPill';

interface InvoiceRowProps {
    invoice: Invoice;
}

/**
 * One row of the invoice table. The whole row links to the detail screen — no actions
 * column.
 *
 * Below `sm` there is no room for six columns, so each field stacks as its own
 * label/value pair instead — the table header (which carries those labels at `sm` and
 * up) hides itself on that breakpoint, see `MyInvoices`.
 */
export function InvoiceRow({invoice}: InvoiceRowProps) {
    const {t, i18n} = useTranslation();
    const dueDate = new Intl.DateTimeFormat(i18n.language, {day: '2-digit', month: 'short', year: 'numeric'}).format(
        invoice.dueDate
    );

    return (
        <Link
            to={invoicingPaths.invoiceDetail(invoice.id)}
            className="border-border-subtle hover:bg-surface-sunken flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:gap-4 sm:py-3"
        >
            <div className="flex items-center justify-between gap-4 sm:w-[140px] sm:shrink-0">
                <p className="text-body text-fg-secondary font-medium">{invoice.number}</p>
                <div className="sm:hidden">
                    <StatusPill status={invoice.status} />
                </div>
            </div>
            <p className="text-body text-fg min-w-0 sm:flex-1 sm:truncate">{invoice.payerName}</p>
            <p className="text-caption text-fg-secondary sm:w-[150px] sm:shrink-0 sm:text-body sm:font-medium">
                <span className="text-fg-muted sm:hidden">{t('invoicing.myInvoices.columns.payerRuc')}: </span>
                {invoice.payerRuc}
            </p>
            <p className="text-caption text-fg-secondary sm:w-[130px] sm:shrink-0 sm:text-body">
                <span className="text-fg-muted sm:hidden">{t('invoicing.myInvoices.columns.dueDate')}: </span>
                {dueDate}
            </p>
            <div className="hidden sm:flex sm:w-[170px] sm:shrink-0 sm:items-center">
                <StatusPill status={invoice.status} />
            </div>
            <p className="text-body text-fg-secondary font-medium sm:w-[150px] sm:shrink-0 sm:text-right">
                {invoice.formattedAmount()}
            </p>
        </Link>
    );
}
