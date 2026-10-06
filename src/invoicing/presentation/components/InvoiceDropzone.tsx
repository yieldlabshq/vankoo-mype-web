import {FileUp} from 'lucide-react';
import {useId, useRef, useState, type DragEvent} from 'react';
import {cn} from '@/lib/utils';

interface InvoiceDropzoneProps {
    title: string;
    hint: string;
    onFileSelected: (file: File) => void;
    disabled?: boolean;
    accept?: string;
}

/**
 * The drag-and-drop target for an invoice PDF.
 *
 * Reports the file the user picked or dropped through a callback and decides nothing
 * about what happens to it next — that is the view's job.
 */
export function InvoiceDropzone({title, hint, onFileSelected, disabled = false, accept = 'application/pdf'}: InvoiceDropzoneProps) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    function handleDrop(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setIsDraggingOver(false);
        if (disabled) return;
        const file = event.dataTransfer.files[0];
        if (file) onFileSelected(file);
    }

    return (
        <label
            htmlFor={inputId}
            onDragOver={event => {
                event.preventDefault();
                if (!disabled) setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={cn(
                'bg-surface-sunken border-border-strong flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors',
                isDraggingOver && 'border-ring',
                disabled && 'pointer-events-none opacity-50'
            )}
        >
            <FileUp className="text-fg size-6" aria-hidden="true" />
            <p className="text-body text-fg font-semibold">{title}</p>
            <p className="text-caption text-fg-muted">{hint}</p>
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept}
                disabled={disabled}
                className="sr-only"
                onChange={event => {
                    const file = event.target.files?.[0];
                    if (file) onFileSelected(file);
                    event.target.value = '';
                }}
            />
        </label>
    );
}
