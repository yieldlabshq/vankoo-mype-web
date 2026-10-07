import {isAxiosError} from 'axios';

/**
 * An RFC 9457 error body, as the platform's services return it.
 *
 * `code` is an extension member and the only field a client should branch on: the
 * status alone is too coarse — two different failures can share a 400 — and `title`
 * and `detail` are English prose written for whoever is reading a log.
 */
export interface ProblemDetail {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    code: string;
    errors?: ProblemViolation[];
}

/** One broken validation rule, named by field and by the rule itself. */
export interface ProblemViolation {
    field: string;
    code: string;
    /** English, for debugging. Never rendered. */
    message?: string;
}

/**
 * Reads the problem out of whatever a failed call threw.
 *
 * Returns null when there is nothing to read — the request never reached the server,
 * or the answer was not a problem+json — which is exactly the case a caller must
 * treat as "we could not connect" rather than as a rejection.
 */
export function toProblemDetail(error: unknown): ProblemDetail | null {
    if (!isAxiosError(error)) return null;
    const body: unknown = error.response?.data;
    if (!isProblemDetail(body)) return null;
    return body;
}

function isProblemDetail(body: unknown): body is ProblemDetail {
    if (typeof body !== 'object' || body === null) return false;
    const candidate = body as Partial<ProblemDetail>;
    return typeof candidate.code === 'string' && typeof candidate.status === 'number';
}
