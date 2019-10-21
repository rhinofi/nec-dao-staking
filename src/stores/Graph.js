import { observable, action, computed } from 'mobx'
import ApolloClient from 'apollo-boost';
import { gql } from "apollo-boost";

export default class GraphStore {
    @observable httpClient = undefined;
    @observable wsClient = undefined;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action setHttpClient(uri) {
        this.httpClient = new ApolloClient({
            uri,
        });
    }

    getHttpClient() {
        return this.httpClient
    }

    async fetchLocks(address) {
        const result = await this.httpClient.query({
            query: gql`{
            locks(orderDirection: asc) {
                id
                locker
                period
                amount
                released
                lockTimestamp
                periodDuration
            }
        }`
        })
        console.log('GRAPHHH', result)
        return result.data.locks
    }

}