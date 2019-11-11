export const prefix = {
    FETCH_PENDING: '[Fetch Pending] ',
    FETCH_SUCCESS: '[Fetch Success] ',
    FETCH_ERROR: '[Fetch Error] ',
    FETCH_STALE: '[Fetch Stale] ',
    ACTION_PENDING: '[Action Pending] ',
    ACTION_SUCCESS: '[Action Success] ',
    ACTION_ERROR: '[Action Error] '
}

export const text = {
    currentBatchTitle: 'Current Period',
    allBatchesTab: 'All Periods',
    yourLocksTab: 'Your Locks'
}

export const tooltip = {
    airdropBlocknumber: `Reputation is distributed based on the Nectar token balances at this block.`,
    airdropExplainer: `Reputation is distributed based on the Nectar token balances at the given block number.`,
    lockTokenExplainer: `You can lock Nectar tokens to receive Reputation in the NectarDAO. The longer you lock your tokens for, the more Reputation you will receive.`,
    noUserLocks: `Looks like you haven't locked any tokens yet! Go to the 'All Periods' tab to create a new token lock`,
    extendLockInstruction: `Select one of your locks in the table to interact with it.`,
    extendLockExplainer: `You can extend a token lock beyond it's original duration to continue receiving Reptuation. Note that the total time locked still cannot exceed the maximum locking duration of 12 months.`,
    lockingNotStarted: `Token locking has not started.`,
    lockingEndedLockInstruction: `All Token locking periods have ended.`,
    lockingEndedLockExplainer: `Tokens can no longer be locked for reputation. You can release tokens from existing locks on the 'Your Locks' tab.`,
    lockingEndedLockExplainer_tab2: `Tokens can no longer be locked for reputation. You can release tokens from your locks via the table.`,
    lockingEndedExtendExplainer: `Tokens can no longer be locked for reputation. You can release tokens from existing locks on the 'Your Locks' tab.`,
    lockingNotStartedInstruction: `Once you have token locks, you can view & extend them here.`,
    lockAtMaximumDurationInstruction: `This lock is already at maximum duration.`,
    bidExplainer: `You can bid GEN in a series of auctions to receive Reputation.`,
    lockAtMaxDuration: `The selected lock is already at the maximum duration.`,
    lockAtMaxDurationTooltip: `Locks cannot be extended past the maximum duration of 12 months.`,
    lockAlreadyExpired: `The selected lock has already past its releaseable date and cannot be extended.`,
    lockAlreadyExpiredTooltip: `You can release the tokens from this lock with the corresponding 'Release' button in the table.`,
    lockAlreadyReleased: `The selected lock has already been released and cannot be extended.`,
    lockAlreadyReleasedTooltip: `You can create a new lock on the 'All Periods' tab.`,
}

export const logs = {

}

export const errors = {
    staticParamsNotLoaded: 'Static params must be loaded to call this function'
}