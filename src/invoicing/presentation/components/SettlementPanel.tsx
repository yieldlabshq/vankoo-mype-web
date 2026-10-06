import {useTranslation} from 'react-i18next';
import {buttonVariants} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import type {Auction} from '../../../investment/domain/model/auction.entity';
import type {FinancialQuote} from '../../../investment/domain/model/financial-quote.entity';
import {formatInvoiceAmount, type InvoiceAmount} from '../../domain/model/invoice.entity';

interface SettlementPanelProps {
    totalAmount: InvoiceAmount;
    /** The invoice's auction, once Investment has opened one. */
    auction: Auction | null;
    /** The quote the MYPE can accept now. Only while the auction is `DRAFT`. */
    quote: FinancialQuote | null;
    /** What the accept button does. Without it, the offer is shown but cannot be taken. */
    onAccept?: () => void;
    accepting?: boolean;
}

/** A percentage in points with two decimals, e.g. "4.20". */
function formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(value);
}

/**
 * The "cascada" — the fixed navy brand surface that says what the MYPE gets.
 *
 * Three states, following the auction rather than the invoice. Before there is a
 * quote there is nothing to price yet, so it shows only the invoice's own amount and
 * says why the rest is still unknown. With a quote it walks from the fundable amount
 * down to what lands in the wallet, and offers to accept. Once accepted, it shows
 * the same figures frozen on the accepted quote, plus how the funding is going.
 *
 * The panel is navy in both themes — see the `Logo`'s own note on fixed-brand
 * surfaces — so its text uses the `decor-panel-fg` tokens rather than the app's usual
 * ones, which would go unreadable in dark mode once the surfaces invert.
 */
export function SettlementPanel({totalAmount, auction, quote, onAccept, accepting = false}: SettlementPanelProps) {
    const {t, i18n} = useTranslation();
    const published = auction?.isPublished() ? auction : null;
    const shownQuote = published?.acceptedQuote ?? quote;

    return (
        <div className="bg-decor-panel-from relative flex w-full max-w-[380px] shrink-0 flex-col gap-3 overflow-hidden rounded-xl p-6">
            <div
                className="bg-decor-light pointer-events-none absolute top-1/3 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
                aria-hidden="true"
            />

            {shownQuote ? (
                <>
                    <Line label={t('investment.offer.invoiceAmount')} value={formatInvoiceAmount(shownQuote.fundableAmount)} />
                    <Line
                        label={t('investment.offer.discount', {percentage: formatPercentage(shownQuote.discount().percentage)})}
                        value={`− ${formatInvoiceAmount(shownQuote.discount().amount)}`}
                    />
                    <Line label={t('investment.offer.net')} value={formatInvoiceAmount(shownQuote.fundingTarget)} />
                    <Line label={t('investment.offer.fee')} value={`− ${formatInvoiceAmount(shownQuote.platformFeeTotal)}`} />
                    <div className="bg-decor-panel-fg/25 relative h-px w-full" />
                    <div className="relative flex flex-col gap-1">
                        <p className="text-caption text-decor-panel-fg/70">{t('investment.offer.receivable')}</p>
                        <p className="text-h1 text-positive-on-inverse font-bold">{formatInvoiceAmount(shownQuote.mypeAdvance)}</p>
                    </div>

                    {published ? (
                        <>
                            <p className="text-caption text-decor-panel-fg/70 relative">
                                {t('investment.offer.publishedOn', {
                                    date: published.publishedAt
                                        ? new Intl.DateTimeFormat(i18n.language, {dateStyle: 'long'}).format(published.publishedAt)
                                        : '—'
                                })}
                            </p>
                            {published.targetAmount && (
                                <p className="text-caption text-decor-panel-fg relative font-semibold">
                                    {t('investment.offer.funded', {
                                        current: formatInvoiceAmount(published.currentFunding),
                                        target: formatInvoiceAmount(published.targetAmount)
                                    })}
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-caption text-decor-panel-fg/70 relative">
                                {t('investment.offer.terms', {
                                    tcea: formatPercentage(shownQuote.mypeTceaPct),
                                    days: shownQuote.termDays,
                                    validUntil: new Intl.DateTimeFormat(i18n.language, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    }).format(shownQuote.validUntil)
                                })}
                            </p>
                            {onAccept && (
                                <button
                                    type="button"
                                    onClick={onAccept}
                                    disabled={accepting}
                                    className={cn(buttonVariants({variant: 'default'}), 'relative mt-2 w-full')}
                                >
                                    {t(accepting ? 'investment.offer.accepting' : 'investment.offer.accept')}
                                </button>
                            )}
                        </>
                    )}
                </>
            ) : (
                <>
                    <p className="text-caption text-decor-panel-fg/70 relative">{t('invoicing.detail.settlement.grossAmount')}</p>
                    <p className="text-h1 text-decor-panel-fg relative font-bold">{formatInvoiceAmount(totalAmount)}</p>
                    <p className="text-caption text-decor-panel-fg/70 relative">{t('invoicing.detail.settlement.pendingFootnote')}</p>
                </>
            )}
        </div>
    );
}

/** One row of the cascade: a muted label on the left, the figure on the right. */
function Line({label, value}: {label: string; value: string}) {
    return (
        <div className="relative flex items-center justify-between gap-4">
            <p className="text-caption text-decor-panel-fg/70">{label}</p>
            <p className="text-body text-decor-panel-fg font-semibold">{value}</p>
        </div>
    );
}
