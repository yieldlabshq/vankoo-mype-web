import {useTranslation} from 'react-i18next';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {investmentErrorKind} from '../../infrastructure/investment-error';

interface InvestmentErrorAlertProps {
    /** What the store caught. Nothing is rendered when it is empty. */
    errors: Error[];
}

/**
 * Turns whatever failed into words the user can act on.
 *
 * Unlike `IamErrorAlert` there is no `code` to translate by: Investment answers with
 * an English sentence, so `investmentErrorKind` sorts it into the three cases that
 * have copy — a quote that can no longer be accepted, an invoice too close to its
 * due date to fund, and everything else.
 */
export function InvestmentErrorAlert({errors}: InvestmentErrorAlertProps) {
    const {t} = useTranslation();
    if (errors.length === 0) return null;
    return (
        <Alert variant="destructive" role="alert">
            <AlertDescription>
                {errors.map(error => t(`investment.errors.${investmentErrorKind(error)}`)).join(' ')}
            </AlertDescription>
        </Alert>
    );
}
