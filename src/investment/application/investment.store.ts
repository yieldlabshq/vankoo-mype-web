import {isAxiosError} from 'axios';
import {create} from 'zustand';
import {useIamStore} from '../../iam/application/iam.store';
import {iamInterceptor} from '../../iam/infrastructure/iam.interceptor';
import type {Auction} from '../domain/model/auction.entity';
import type {FinancialQuote} from '../domain/model/financial-quote.entity';
import {AuctionAssembler} from '../infrastructure/auction.assembler';
import {InvestmentApi} from '../infrastructure/investment-api';
import {investmentErrorKind} from '../infrastructure/investment-error';

const investmentApi = new InvestmentApi({requestInterceptors: [iamInterceptor]});

/** State and use cases of the investment bounded context, as far as a MYPE drives it. */
export interface InvestmentState {
    /** The auction opened for the invoice on screen. Null while none exists yet. */
    auction: Auction | null;
    /** The quote the MYPE can accept right now. Only while the auction is `DRAFT`. */
    quote: FinancialQuote | null;
    offerLoading: boolean;
    offerLoaded: boolean;
    accepting: boolean;
    errors: Error[];
    /**
     * Finds the invoice's auction and, if it is waiting on the MYPE, the offer to show.
     *
     * Asks for the active quote first and only prices a new one when there is none:
     * every `POST /quotes` supersedes the previous quote, so pricing on every visit
     * would make the figure the MYPE is looking at expire under her.
     */
    loadOffer: (invoiceId: string) => Promise<void>;
    /**
     * Re-reads the auction, and answers with it, for the detail's polling.
     *
     * A failed read keeps the last known auction rather than reporting an error, the
     * same as `refreshUploadedInvoice`: this runs on a timer, and one dropped request
     * is not something to put in front of the person while the next is seconds away.
     */
    refreshAuction: (invoiceId: string) => Promise<Auction | null>;
    /**
     * Accepts the quote on screen, which publishes the auction.
     *
     * Resolves to whether it went through. A refusal because the quote is no longer
     * active — it expired, or a newer one superseded it — reloads the offer so the
     * screen shows the one that can be accepted, and keeps the error so it can say why.
     */
    acceptQuote: () => Promise<boolean>;
    clearErrors: () => void;
    /** Forgets the offer, so leaving the detail does not flash another invoice's figures. */
    clearOffer: () => void;
}

/**
 * The application layer of the investment context.
 *
 * The only thing that talks to `InvestmentApi`, and the only place `AuctionAssembler`
 * is called. It reads the session through IAM's store rather than by decoding the
 * token itself: who the MYPE is belongs to IAM.
 */
export const useInvestmentStore = create<InvestmentState>()((set, get) => ({
    auction: null,
    quote: null,
    offerLoading: false,
    offerLoaded: false,
    accepting: false,
    errors: [],

    loadOffer: async invoiceId => {
        set({offerLoading: true, errors: []});
        try {
            const auction = await findAuction(invoiceId);
            const quote = auction?.canBeQuoted() ? await findOrCreateQuote(auction.id) : null;
            set({auction, quote, offerLoading: false, offerLoaded: true});
        } catch (error) {
            set({errors: [error as Error], auction: null, quote: null, offerLoading: false, offerLoaded: true});
        }
    },

    refreshAuction: async invoiceId => {
        try {
            const auction = await findAuction(invoiceId);
            // The screen may have moved to another invoice while this was in flight.
            if (!get().offerLoaded) return get().auction;
            // The first read after the evaluation lands is also the first chance to price.
            const quote = auction?.canBeQuoted() ? (get().quote ?? (await findOrCreateQuote(auction.id))) : null;
            set({auction, quote});
            return auction;
        } catch {
            return get().auction;
        }
    },

    acceptQuote: async () => {
        const {auction, quote} = get();
        if (!auction || !quote) return false;
        set({accepting: true, errors: []});
        try {
            const response = await investmentApi.acceptQuote(auction.id, quote.id);
            const published = AuctionAssembler.toAuctionFromResponse(response);
            set({auction: published ?? auction, quote: null, accepting: false});
            return true;
        } catch (error) {
            set({errors: [error as Error], accepting: false});
            if (investmentErrorKind(error) === 'quoteNotActive') {
                // Whatever replaced it is what the MYPE can accept now; the error stays
                // so the screen can explain why the figures changed.
                const errors = get().errors;
                await get().loadOffer(auction.invoiceId);
                set({errors});
            }
            return false;
        }
    },

    clearErrors: () => set({errors: []}),
    clearOffer: () => set({auction: null, quote: null, offerLoaded: false, errors: []})
}));

/**
 * The invoice's auction among everything the signed-in MYPE owns, or null.
 *
 * Investment answers the list for the owner only — the gateway puts the token's
 * subject in `X-User-Id` and the service compares — so the id in the path has to be
 * the session's. A missing session is not a request worth sending.
 */
async function findAuction(invoiceId: string): Promise<Auction | null> {
    const mypeId = useIamStore.getState().session?.user.id;
    if (!mypeId) throw new Error('No session to read auctions for');
    const response = await investmentApi.getAuctionsByMype(mypeId);
    return AuctionAssembler.toAuctionForInvoiceFromResponse(response, invoiceId);
}

/** The quote that can still be accepted, priced fresh only when there is none. */
async function findOrCreateQuote(auctionId: string): Promise<FinancialQuote> {
    try {
        return AuctionAssembler.toQuoteFromResponse(await investmentApi.getActiveQuote(auctionId));
    } catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 404) throw error;
        return AuctionAssembler.toQuoteFromResponse(await investmentApi.createQuote(auctionId));
    }
}
