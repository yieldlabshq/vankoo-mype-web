import {ChevronLeft, ChevronRight} from 'lucide-react';
import {cn} from '@/lib/utils';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /** e.g. "6 de 24 resultados" — composed by the caller, which knows both counts. */
    summary: string;
}

/**
 * Desktop pagination, shared by any list the backend paginates server-side (the
 * invoice list and the wallet's movements, per the design). There is no mobile
 * variant: below the `md` breakpoint the pattern is a ghost "Ver más" button instead.
 */
export function Pagination({page, totalPages, onPageChange, summary}: PaginationProps) {
    const pages = Array.from({length: totalPages}, (_, index) => index + 1);

    return (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption text-fg-muted">{summary}</p>
            <div className="flex items-center gap-2 overflow-x-auto">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    className="border-border-strong flex size-9 shrink-0 items-center justify-center rounded-md border disabled:opacity-40"
                >
                    <ChevronLeft className="size-4" />
                </button>
                {pages.map(pageNumber => (
                    <button
                        key={pageNumber}
                        type="button"
                        onClick={() => onPageChange(pageNumber)}
                        className={cn(
                            'text-caption flex size-9 shrink-0 items-center justify-center rounded-md border',
                            pageNumber === page
                                ? 'bg-surface-inverse text-fg-inverse border-transparent font-semibold'
                                : 'border-border-strong text-fg'
                        )}
                    >
                        {pageNumber}
                    </button>
                ))}
                <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="border-border-strong flex size-9 shrink-0 items-center justify-center rounded-md border disabled:opacity-40"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    );
}
