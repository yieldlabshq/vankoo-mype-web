import {create} from 'zustand';
import {iamInterceptor} from '../../iam/infrastructure/iam.interceptor';
import type {InvoiceDetail} from '../domain/model/invoice-detail.entity';
import type {InvoiceStatus} from '../domain/model/invoice-status';
import type {Invoice} from '../domain/model/invoice.entity';
import {InvoiceAssembler} from '../infrastructure/invoice.assembler';
import {InvoicingApi, type InvoiceListQuery} from '../infrastructure/invoicing-api';
import type {UploadInvoiceCommand} from '../domain/model/upload-invoice.command';

const invoicingApi = new InvoicingApi({requestInterceptors: [iamInterceptor]});

/** State and use cases of the invoicing bounded context. */
export interface InvoicingState {
    submitting: boolean;
    errors: Error[];
    /** The id the backend answered with, so the view can confirm the upload succeeded. */
    uploadedInvoiceId: string | null;
    /** Where that invoice actually is, as the service last reported it. */
    uploadedInvoiceStatus: InvoiceStatus | null;
    uploadInvoice: (command: UploadInvoiceCommand) => Promise<boolean>;
    /**
     * Asks the service where the uploaded invoice is now, and answers with it.
     *
     * A failed read keeps the last known status rather than reporting an error: this
     * runs on a timer, and one dropped request is not something to put in front of
     * the person while the next one is two seconds away.
     */
    refreshUploadedInvoice: () => Promise<InvoiceStatus | null>;
    /**
     * Opens that invoice's PDF in a new tab.
     *
     * Fetches it through the authenticated client rather than handing the browser a
     * plain URL: the gateway requires a bearer token on this route, which only a
     * `fetch`/`axios` request can carry, not a bare `<a href>`.
     */
    openInvoiceFile: (invoiceId: string) => Promise<void>;
    clearErrors: () => void;
    /** Forgets the last upload, so the dropzone can be used again. */
    reset: () => void;

    invoices: Invoice[];
    invoicesLoading: boolean;
    invoicesLoaded: boolean;
    fetchInvoices: (query?: InvoiceListQuery) => Promise<void>;

    invoiceDetail: InvoiceDetail | null;
    invoiceDetailLoading: boolean;
    invoiceDetailLoaded: boolean;
    fetchInvoiceDetail: (invoiceId: string) => Promise<void>;
    /** Forgets the last detail read, so leaving the screen does not flash stale data on the next visit. */
    clearInvoiceDetail: () => void;
}

/**
 * The application layer of the invoicing context.
 *
 * The only thing that talks to `InvoicingApi`, and the only place `InvoiceAssembler`
 * is called.
 */
export const useInvoicingStore = create<InvoicingState>()((set, get) => ({
    submitting: false,
    errors: [],
    uploadedInvoiceId: null,
    uploadedInvoiceStatus: null,
    invoices: [],
    invoicesLoading: false,
    invoicesLoaded: false,
    invoiceDetail: null,
    invoiceDetailLoading: false,
    invoiceDetailLoaded: false,

    uploadInvoice: async command => {
        set({submitting: true, errors: []});
        try {
            const response = await invoicingApi.uploadInvoice(command.file);
            const invoiceId = InvoiceAssembler.toInvoiceIdFromResponse(response);
            if (!invoiceId) {
                set({errors: [new Error('Upload answered without an invoice id')], submitting: false});
                return false;
            }
            // UPLOADED is what a successful POST means; the next read replaces it.
            set({uploadedInvoiceId: invoiceId, uploadedInvoiceStatus: 'UPLOADED', submitting: false});
            return true;
        } catch (error) {
            set({errors: [error as Error], submitting: false});
            return false;
        }
    },

    openInvoiceFile: async invoiceId => {
        // Opened before the request resolves — a browser only allows `window.open` to
        // create a real tab synchronously from the click; doing it after the `await`
        // makes most browsers treat it as an unrequested popup and block it.
        const fileTab = window.open('', '_blank');
        try {
            const response = await invoicingApi.downloadInvoiceFile(invoiceId);
            const blobUrl = URL.createObjectURL(response.data);
            if (fileTab) fileTab.location.href = blobUrl;
            else set({errors: [new Error('Pop-up blocked')]});
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        } catch (error) {
            fileTab?.close();
            set({errors: [error as Error]});
        }
    },

    refreshUploadedInvoice: async () => {
        const invoiceId = get().uploadedInvoiceId;
        if (!invoiceId) return null;
        try {
            const response = await invoicingApi.getInvoiceById(invoiceId);
            const detail = InvoiceAssembler.toInvoiceDetailFromResponse(response);
            // The upload may have been reset while this was in flight.
            if (!detail || get().uploadedInvoiceId !== invoiceId) return get().uploadedInvoiceStatus;
            set({uploadedInvoiceStatus: detail.status});
            return detail.status;
        } catch {
            return get().uploadedInvoiceStatus;
        }
    },

    clearErrors: () => set({errors: []}),
    reset: () => set({uploadedInvoiceId: null, uploadedInvoiceStatus: null, errors: [], submitting: false}),

    fetchInvoices: async (query = {}) => {
        set({invoicesLoading: true, errors: []});
        try {
            const response = await invoicingApi.getInvoices(query);
            const invoices = InvoiceAssembler.toInvoicesFromResponse(response);
            set({invoices, invoicesLoading: false, invoicesLoaded: true});
        } catch (error) {
            set({errors: [error as Error], invoices: [], invoicesLoading: false, invoicesLoaded: true});
        }
    },

    fetchInvoiceDetail: async invoiceId => {
        set({invoiceDetailLoading: true, errors: []});
        try {
            const response = await invoicingApi.getInvoiceById(invoiceId);
            const invoiceDetail = InvoiceAssembler.toInvoiceDetailFromResponse(response);
            set({invoiceDetail, invoiceDetailLoading: false, invoiceDetailLoaded: true});
        } catch (error) {
            set({errors: [error as Error], invoiceDetail: null, invoiceDetailLoading: false, invoiceDetailLoaded: true});
        }
    },

    clearInvoiceDetail: () => set({invoiceDetail: null, invoiceDetailLoaded: false})
}));
