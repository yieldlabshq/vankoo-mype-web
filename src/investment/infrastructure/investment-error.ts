import {isAxiosError} from 'axios';

/**
 * What Investment says when a call fails, sorted into the cases a screen can word.
 *
 * Investment does not speak problem+json: every failure is `{"message": "..."}`
 * with an English sentence and a status that only says which kind of rule broke
 * (400 for a bad argument, 409 for a state the aggregate refuses). The sentence is
 * the only thing that separates one 409 from another, so this is where the matching
 * lives — once, and away from the components.
 */
export type InvestmentErrorKind = 'quoteNotActive' | 'tooCloseToDueDate' | 'unknown';

/** The `message` Investment puts in every error body, or an empty string. */
export function investmentErrorMessage(error: unknown): string {
    if (!isAxiosError(error)) return '';
    const body: unknown = error.response?.data;
    if (typeof body !== 'object' || body === null) return '';
    const message = (body as {message?: unknown}).message;
    return typeof message === 'string' ? message : '';
}

/** Which of the cases the screen knows how to explain this failure is. */
export function investmentErrorKind(error: unknown): InvestmentErrorKind {
    if (!isAxiosError(error) || error.response?.status !== 409) return 'unknown';
    const message = investmentErrorMessage(error);
    if (/not active/i.test(message)) return 'quoteNotActive';
    if (/too close to its due date/i.test(message)) return 'tooCloseToDueDate';
    return 'unknown';
}
