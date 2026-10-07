import type {RouteObject} from 'react-router';
import {InvoiceDetail} from './views/InvoiceDetail';
import {MyInvoices} from './views/MyInvoices';
import {UploadInvoice} from './views/UploadInvoice';

/**
 * Routes of the invoicing bounded context, mounted by the root router under
 * `/invoicing`. Paths stay relative here; `invoicing-paths.ts` owns the absolute ones.
 *
 * `upload` is listed before `:id` on purpose: React Router matches in array order for
 * routes of equal specificity, and `:id` would otherwise swallow `/invoicing/upload`.
 */
export const invoicingRoutes: RouteObject[] = [
    {index: true, Component: MyInvoices},
    {path: 'upload', Component: UploadInvoice},
    {path: ':id', Component: InvoiceDetail}
];
