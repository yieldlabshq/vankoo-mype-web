import {useTranslation} from 'react-i18next';
import {Alert, AlertDescription} from '@/components/ui/alert';

interface InvoicingErrorAlertProps {
    /** What the store caught. Nothing is rendered when it is empty. */
    errors: Error[];
}

/**
 * Turns whatever failed into words the user can act on.
 *
 * Simpler than `IamErrorAlert` on purpose: the invoicing service does not document
 * per-code errors for this endpoint yet, so every failure reads the same generic
 * line until it does.
 */
export function InvoicingErrorAlert({errors}: InvoicingErrorAlertProps) {
    const {t} = useTranslation();
    if (errors.length === 0) return null;
    return (
        <Alert variant="destructive" role="alert">
            <AlertDescription>{t('invoicing.errors.uploadFailed')}</AlertDescription>
        </Alert>
    );
}
