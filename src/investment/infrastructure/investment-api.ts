import type {AxiosResponse} from 'axios';
import {BaseApi, type BaseApiOptions} from '../../shared/infrastructure/base-api';
import type {AuctionResource} from './auction.resource';
import type {FinancialQuoteResource} from './financial-quote.resource';

const auctionsEndpointPath = import.meta.env.VITE_AUCTIONS_ENDPOINT_PATH;

/**
 * The API of the investment bounded context, as far as a MYPE uses it.
 *
 * None of these calls is CRUD on the auction — the MYPE never creates, edits or
 * deletes one; an event does — so there is no `BaseEndpoint` to compose. Each call
 * reaches `this.http` with its own path.
 *
 * Every route is behind the gateway's JWT, and the gateway turns the token's subject
 * into the `X-User-Id` header Investment checks the owner against. Calling the
 * service directly would need that header set by hand.
 */
export class InvestmentApi extends BaseApi {
    constructor(options: BaseApiOptions = {}) {
        super(options);
    }

    /** Every auction the MYPE owns — `GET .../mype/{mypeId}`. */
    getAuctionsByMype(mypeId: string): Promise<AxiosResponse<AuctionResource[]>> {
        return this.http.get(`${auctionsEndpointPath}/mype/${mypeId}`);
    }

    /** The quote the MYPE can still accept — `GET .../{id}/quotes/active`. 404 when there is none. */
    getActiveQuote(auctionId: string): Promise<AxiosResponse<FinancialQuoteResource>> {
        return this.http.get(`${auctionsEndpointPath}/${auctionId}/quotes/active`);
    }

    /** Asks Investment to price the auction — `POST .../{id}/quotes`. Supersedes the active one. */
    createQuote(auctionId: string): Promise<AxiosResponse<FinancialQuoteResource>> {
        return this.http.post(`${auctionsEndpointPath}/${auctionId}/quotes`);
    }

    /** Accepts a quote, which publishes the auction — `POST .../{id}/quotes/{quoteId}/accept`. */
    acceptQuote(auctionId: string, quoteId: string): Promise<AxiosResponse<AuctionResource>> {
        return this.http.post(`${auctionsEndpointPath}/${auctionId}/quotes/${quoteId}/accept`);
    }
}
