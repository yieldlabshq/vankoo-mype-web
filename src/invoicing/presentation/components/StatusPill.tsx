import {useTranslation} from 'react-i18next';
import {cn} from '@/lib/utils';
import {presentationForStatus, type InvoiceStatus} from '../../domain/model/invoice-status';

interface StatusPillProps {
    status: InvoiceStatus;
}

/** One `InvoiceStatus`, colored and worded the way the rail does. */
export function StatusPill({status}: StatusPillProps) {
    const {t} = useTranslation();
    const presentation = presentationForStatus(status);

    return (
        <span
            className={cn(
                'text-caption inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold whitespace-nowrap',
                presentation.bgClass,
                presentation.fgClass
            )}
        >
            <span className="size-1.5 shrink-0 rounded-full bg-current" />
            {t(presentation.labelKey)}
        </span>
    );
}
