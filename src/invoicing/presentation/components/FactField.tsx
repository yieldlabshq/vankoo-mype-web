import {useTranslation} from 'react-i18next';

interface FactFieldProps {
    label: string;
    /** Null while the OCR has not read it — shown as a dash rather than left blank. */
    value: string | null;
}

/** One labeled fact in the "Datos que leímos de la factura" grid. */
export function FactField({label, value}: FactFieldProps) {
    const {t} = useTranslation();
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-caption text-fg-muted">{label}</p>
            <p className="text-body text-fg font-semibold">{value ?? t('invoicing.detail.facts.unread')}</p>
        </div>
    );
}
