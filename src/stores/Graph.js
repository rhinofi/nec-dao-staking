import { observable, action, computed } from 'mobx'
import { createApolloFetch } from 'apollo-fetch';

export default class GraphStore {
    @observable httpClient = undefined;
    @observable wsClient = undefined;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action setHttpClient(uri) {
        this.httpClient = createApolloFetch({ uri });
    }

    getHttpClient() {
        return this.httpClient
    }

    async fetchLocks(address) {
        const query = `{
            locks(orderDirection: asc) {
                id
                locker
                period
                amount
                released
                lockTimestamp
                periodDuration
            }
        }`;

        const result = await this.httpClient({ query })
        console.log('Fetch Locks', result)
        return result.data.locks
    }

    async fetchAllBatches() {
        const query = `{
            locks(orderDirection: asc) {
                id
                locker
                period
                amount
                released
                lockTimestamp
                periodDuration
            }
        }`;

        const result = await this.httpClient({ query })
        console.log('Fetch Batches', result)
        return result.data.batches
    }

    async fetchScore(batchId, userAddress) {
        const query = `{
            locks(orderDirection: asc) {
                id
                locker
                period
                amount
                released
                lockTimestamp
                periodDuration
            }
        }`;

        const result = await this.httpClient({ query })
        console.log('Fetch Batches', result)
        return result.data.score
    }
}