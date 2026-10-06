import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {buttonVariants} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {useInvoicingStore} from '../../application/invoicing.store';
import {isInvoiceInProgress, railStateFor} from '../../domain/model/invoice-status';
import {UploadInvoiceCommand} from '../../domain/model/upload-invoice.command';
import {InvoiceDropzone} from '../components/InvoiceDropzone';
import {InvoiceRail} from '../components/InvoiceRail';
import {InvoicingErrorAlert} from '../components/InvoicingErrorAlert';
import {StatusPill} from '../components/StatusPill';
import {UploadedFileCard} from '../components/UploadedFileCard';
import {invoicingPaths} from '../invoicing-paths';
import {RAIL_MILESTONES, railCaptionKey} from '../rail-caption';

/** How big a `File.size` (in bytes) reads to a person. */
function formatFileSize(bytes: number): string {
    const megabytes = bytes / (1024 * 1024);
    if (megabytes >= 0.1) return `${megabytes.toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * How often, and for how long, the screen asks where the uploaded invoice is.
 *
 * The OCR takes seconds, so two is often enough to feel live without hammering the
 * service. The cap is there because, today, nothing moves an invoice past
 * `DATA_EXTRACTED`: SUNAT validation does not exist yet, and without a limit the
 * screen would ask forever about a status that will not change. A minute covers the
 * read with room to spare; after that, reopening the page asks again.
 */
const STATUS_POLL_INTERVAL_MS = 2000;
const STATUS_POLL_MAX_ATTEMPTS = 30;

/** Routed view where a MYPE submits an invoice for the platform to read and validate. */
export function UploadInvoice() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const submitting = useInvoicingStore(state => state.submitting);
    const errors = useInvoicingStore(state => state.errors);
    const uploadedInvoiceId = useInvoicingStore(state => state.uploadedInvoiceId);
    const uploadedInvoiceStatus = useInvoicingStore(state => state.uploadedInvoiceStatus);
    const uploadInvoice = useInvoicingStore(state => state.uploadInvoice);
    const refreshUploadedInvoice = useInvoicingStore(state => state.refreshUploadedInvoice);
    const openInvoiceFile = useInvoicingStore(state => state.openInvoiceFile);
    const reset = useInvoicingStore(state => state.reset);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // The rail follows the service, not a clock. Each read schedules the next only
    // once it has answered, so a slow response never stacks a second one behind it.
    useEffect(() => {
        if (!uploadedInvoiceId) return;
        let cancelled = false;
        let attempts = 0;
        let timer: ReturnType<typeof setTimeout>;

        const poll = async () => {
            const status = await refreshUploadedInvoice();
            attempts += 1;
            if (cancelled) return;
            if (status && isInvoiceInProgress(status) && attempts < STATUS_POLL_MAX_ATTEMPTS) {
                timer = setTimeout(() => void poll(), STATUS_POLL_INTERVAL_MS);
            }
        };

        timer = setTimeout(() => void poll(), STATUS_POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [uploadedInvoiceId, refreshUploadedInvoice]);

    // REJECTED has no place on the rail; the pill beside it still says what happened.
    const rail = uploadedInvoiceStatus ? railStateFor(uploadedInvoiceStatus) : null;
    // Once the read is behind it, the detail is where the offer will appear — and,
    // with no invoice list yet, this button is the only way there.
    const readComplete = rail !== null && rail.currentIndex >= RAIL_MILESTONES.indexOf('validating');

    const steps = [
        {label: t('invoicing.upload.steps.received')},
        {label: t('invoicing.upload.steps.reading')},
        {label: t('invoicing.upload.steps.validating')},
        {label: t('invoicing.upload.steps.approved')},
        {label: t('invoicing.upload.steps.inAuction')}
    ];

    async function handleFileSelected(file: File) {
        setSelectedFile(file);
        const uploaded = await uploadInvoice(new UploadInvoiceCommand({file}));
        if (!uploaded) setSelectedFile(null);
    }

    function handleReset() {
        setSelectedFile(null);
        reset();
    }

    return (
        <div className="flex w-full flex-col gap-8">
            <h1 className="text-h1 text-fg font-bold">{t('invoicing.upload.title')}</h1>

            <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-8">
                <InvoicingErrorAlert errors={errors} />

                {uploadedInvoiceId && selectedFile ? (
                    <>
                        <UploadedFileCard
                            fileName={selectedFile.name}
                            fileDetail={`${formatFileSize(selectedFile.size)} · ${t('invoicing.upload.uploadComplete')}`}
                            onRemove={handleReset}
                            removeLabel={t('invoicing.upload.removeFile')}
                        />
                        {uploadedInvoiceStatus && <StatusPill status={uploadedInvoiceStatus} />}
                        <InvoiceRail
                            steps={steps}
                            currentIndex={rail?.currentIndex}
                            currentState={rail?.currentState}
                        />
                        {rail && <p className="text-caption text-fg-muted">{t(railCaptionKey(rail))}</p>}
                        <div className="flex flex-wrap items-start gap-4">
                            {readComplete && (
                                <button
                                    type="button"
                                    onClick={() => navigate(invoicingPaths.invoiceDetail(uploadedInvoiceId))}
                                    className={buttonVariants({variant: 'default'})}
                                >
                                    {t('invoicing.upload.viewDetail')}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => void openInvoiceFile(uploadedInvoiceId)}
                                className={buttonVariants({variant: 'secondary'})}
                            >
                                {t('invoicing.upload.viewInvoice')}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className={cn(buttonVariants({variant: 'ghost'}), 'border-border-strong')}
                            >
                                {t('invoicing.upload.uploadAnother')}
                            </button>
                        </div>
                    </>
                ) : submitting ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                        <Spinner className="size-6" />
                        <p className="text-caption text-fg-muted">{t('invoicing.upload.submitting')}</p>
                    </div>
                ) : (
                    <>
                        <InvoiceDropzone
                            title={t('invoicing.upload.dropzone.cta')}
                            hint={t('invoicing.upload.dropzone.hint')}
                            onFileSelected={handleFileSelected}
                        />
                        <p className="text-caption text-fg-muted">{t('invoicing.upload.helper')}</p>
                    </>
                )}
            </div>

            {!uploadedInvoiceId && (
                <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-8">
                    <p className="text-body text-fg font-semibold">{t('invoicing.upload.afterTitle')}</p>
                    <InvoiceRail steps={steps} />
                    <p className="text-caption text-fg-muted">{t('invoicing.upload.afterBody')}</p>
                </div>
            )}
        </div>
    );
}
