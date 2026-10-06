/** Attributes an upload-invoice command is built from. */
export interface UploadInvoiceCommandAttributes {
    file: File;
}

/**
 * Intent to submit an invoice file for the platform to read and validate.
 *
 * Carries the raw `File` rather than its bytes or a base64 string: the gateway builds
 * the `FormData` the backend's `multipart/form-data` endpoint expects, and only a
 * `File`/`Blob` lets it do that without reading the whole thing into memory first.
 */
export class UploadInvoiceCommand {
    readonly file: File;

    constructor({file}: UploadInvoiceCommandAttributes) {
        this.file = file;
    }
}
