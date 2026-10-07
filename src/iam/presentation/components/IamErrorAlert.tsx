import {useTranslation} from 'react-i18next';
import {Alert, AlertDescription} from '@/components/ui/alert';
import type es from '@/locales/es.json';
import {toProblemDetail} from '@/shared/infrastructure/problem-detail';

/** Every key under `iam.errors`, derived from the locale file rather than repeated. */
type IamErrorKey = `iam.errors.${keyof typeof es.iam.errors & string}`;

interface IamErrorAlertProps {
    /** What the store caught. Nothing is rendered when it is empty. */
    errors: Error[];
    /** Key to use when the server did not say anything more specific. */
    fallback: IamErrorKey;
}

/**
 * Turns whatever failed into words the user can act on.
 *
 * The store keeps the error, not a message — a message it had already worded would
 * stay frozen in whichever language was active when the call failed, and would not
 * follow a language change. So the translation happens here, on every render.
 *
 * Three outcomes, in order. A problem+json body names its own `code`, which is the
 * translation key, exactly as the platform's error contract intends. A response we
 * could not read at all means the request never got an answer, and saying "wrong
 * password" then would blame the user for an outage. And a code this build has never
 * heard of is a backend that moved ahead of the app, which is the caller's fallback
 * rather than an English detail leaking onto the screen.
 */
export function IamErrorAlert({errors, fallback}: IamErrorAlertProps) {
    const {t, i18n} = useTranslation();

    if (errors.length === 0) return null;

    function messageFor(error: Error): string {
        const problem = toProblemDetail(error);
        if (!problem) return t('iam.errors.unreachable');
        // The code comes from the server, so the key cannot be checked at compile time.
        // `i18n.exists` checks it at run time instead, which is what makes the assertion
        // on the next line true — and it is the only place in the app that needs one.
        const key = `iam.errors.${problem.code}`;
        return i18n.exists(key) ? t(key as IamErrorKey) : t(fallback);
    }

    return (
        <Alert variant="destructive" role="alert">
            <AlertDescription>{errors.map(messageFor).join(' ')}</AlertDescription>
        </Alert>
    );
}
