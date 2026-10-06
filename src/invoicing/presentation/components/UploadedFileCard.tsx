import {FileText, X} from 'lucide-react';

interface UploadedFileCardProps {
    fileName: string;
    fileDetail: string;
    onRemove?: () => void;
    removeLabel: string;
}

/** The "Con archivo" state of `FileUpload`: what got sent, and a way to undo it. */
export function UploadedFileCard({fileName, fileDetail, onRemove, removeLabel}: UploadedFileCardProps) {
    return (
        <div className="bg-surface-sunken border-border-default flex w-full items-center gap-3 rounded-md border p-4">
            <FileText className="text-fg size-5 shrink-0" aria-hidden="true" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-body text-fg truncate font-semibold">{fileName}</p>
                <p className="text-caption text-fg-muted">{fileDetail}</p>
            </div>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-fg-muted hover:text-fg shrink-0"
                    aria-label={removeLabel}
                >
                    <X className="size-5" />
                </button>
            )}
        </div>
    );
}
