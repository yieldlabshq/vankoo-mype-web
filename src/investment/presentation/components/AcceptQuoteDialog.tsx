import {useTranslation} from 'react-i18next';
import {buttonVariants} from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {cn} from '@/lib/utils';
import {formatInvoiceAmount} from '../../../invoicing/domain/model/invoice.entity';
import type {FinancialQuote} from '../../domain/model/financial-quote.entity';

interface AcceptQuoteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quote: FinancialQuote;
    onConfirm: () => void;
    confirming: boolean;
}

/**
 * The "are you sure" before an offer is accepted.
 *
 * Accepting is the one irreversible thing a MYPE does here: it publishes the invoice
 * to the investors, and cancelling an auction is not something this app exposes. So
 * the button on the panel asks first, and this is where it repeats the one figure
 * that matters — what she will receive — next to what saying yes actually does.
 */
export function AcceptQuoteDialog({open, onOpenChange, quote, onConfirm, confirming}: AcceptQuoteDialogProps) {
    const {t} = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="text-h3 text-fg font-bold">{t('investment.offer.dialog.title')}</DialogTitle>
                    <DialogDescription className="text-body text-fg-muted">
                        {t('investment.offer.dialog.body', {amount: formatInvoiceAmount(quote.mypeAdvance)})}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose
                        disabled={confirming}
                        className={cn(buttonVariants({variant: 'ghost'}), 'border-border-strong')}
                    >
                        {t('investment.offer.dialog.cancel')}
                    </DialogClose>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={confirming}
                        className={buttonVariants({variant: 'default'})}
                    >
                        {t(confirming ? 'investment.offer.accepting' : 'investment.offer.dialog.confirm')}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
