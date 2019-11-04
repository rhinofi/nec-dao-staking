import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import BigNumber from "utils/bignumber"
import { BidStaticParams, Auction, AuctionStatus } from 'types'

const BID_EVENT = 'Bid'

interface BidEvent {
    bidder: string;
    auctionId: number,
    amount: BigNumber
}

interface Params {
    account: string;
}

type Bids = Map<string, BigNumber>
type AuctionData = Map<number, Auction>

export class AuctionDataFetch extends BaseFetch {
    params: Params;
    constructor(contract, rootStore: RootStore, params: Params) {
        const fetchText = 'Auction Data'
        super(contract, fetchText, rootStore, params)
        this.params = params
    }

    parseBidEvent(event): BidEvent {
        const { _bidder, _auctionId, _amount } = event.returnValues

        return {
            bidder: _bidder,
            auctionId: Number(_auctionId),
            amount: new BigNumber(_amount)
        }
    }

    newAuction(): Auction {
        return new Auction(
            new BigNumber(0),
            new Map<string, BigNumber>(),
            AuctionStatus.NOT_STARTED,
            new Map<string, BigNumber>()
        )
    }

    calcAuctionReward(auction: Auction, user: string): BigNumber {
        const userBid = auction.bids[user] as BigNumber
        const totalBid = auction.totalBid
        const totalReward = this.rootStore.bidGENStore.staticParams.auctionRepReward

        const repRelation = userBid.times(totalReward)
        const reward = repRelation.div(totalBid)
        return reward
    }

    async fetchData(): Promise<FetchActionResult> {
        const finalAuction = this.rootStore.bidGENStore.getFinalAuctionIndex()
        let currentAuction = this.rootStore.bidGENStore.getActiveAuction()
        const auctionsEnded = this.rootStore.bidGENStore.areAuctionsOver()

        if (currentAuction > finalAuction) {
            currentAuction = finalAuction
        }

        let auctionDataLoaded = false
        const auctions = new Map<number, Auction>()

        const bidEvents = await this.contract.getPastEvents(BID_EVENT, {
            fromBlock: 0,
            toBlock: 'latest'
        })

        // Early return if we're before the start
        if (currentAuction < 0) {
            return {
                status: StatusEnum.SUCCESS,
                data: {
                    auctionDataLoaded: true,
                    auctionData: auctions,
                    auctionCount: 0
                }
            }
        }

        for (let auctionId = 0; auctionId <= currentAuction; auctionId += 1) {
            const auction = this.newAuction()

            if (auctionId < currentAuction) {
                auction.status = AuctionStatus.COMPLETE
            } else if (auctionId === finalAuction && auctionsEnded) {
                auction.status = AuctionStatus.COMPLETE
            }
            else if (auctionId === currentAuction) {
                auction.status = AuctionStatus.IN_PROGRESS
            } else {
                auction.status = AuctionStatus.NOT_STARTED
            }

            auctions.set(auctionId, auction)
        }

        for (const event of bidEvents) {
            const bid = this.parseBidEvent(event)

            if (!auctions.has(bid.auctionId)) {
                throw new Error(`Auction ID ${bid.auctionId} in Event isn't valid`)
            }
            const auction = auctions.get(bid.auctionId) as Auction

            if (!auction.bids[bid.bidder]) {
                auction.bids[bid.bidder] = new BigNumber(0)
            }

            const currentBid = auction.bids[bid.bidder]
            const amountToAdd = bid.amount

            auction.bids[bid.bidder] = (currentBid.plus(amountToAdd))

            const currentTotalBid = auction.totalBid
            auction.totalBid = (currentTotalBid.plus(amountToAdd))

            auctions.set(bid.auctionId, auction)
        }

        auctions.forEach((auction, key) => {
            if (auction.status === AuctionStatus.COMPLETE && auction.bids[this.params.account]) {
                const repReward = this.calcAuctionReward(auction, this.params.account)
                auction.rep[this.params.account] = repReward
                auctions.set(key, auction)
            }
        })

        return {
            status: StatusEnum.SUCCESS,
            data: {
                auctionDataLoaded: true,
                auctionData: auctions,
                auctionCount: Number(currentAuction) + 1
            }
        }
    }
}