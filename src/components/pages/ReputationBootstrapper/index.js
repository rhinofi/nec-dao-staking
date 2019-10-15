import React from 'react'
import { observer, inject } from 'mobx-react'
import { Switch, Route } from 'react-router-dom'
import styled from 'styled-components'
import Selector from './Selector'
import LockNEC from './LockNEC'
import Airdrop from './Airdrop'
import BidGEN from './BidGEN'

const RootWrapper = styled.div`
  width:100%;
  max-width: 932px;
  min-width: 932px;
  margin: 0px auto;
  padding: 64px;
`

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--border);
  border-top: none;
`

const ReputationBoostrapper = () => {
  return (
    <RootWrapper>
      <Selector height="159px" />
      <SectionWrapper>
        <Switch>
          <Route exact path="/lock-nec">
            <LockNEC />
          </Route>
          <Route exact path="/airdrop">
            <Airdrop />
          </Route>
          <Route exact path="/bid-gen">
            <BidGEN />
          </Route>
        </Switch>
      </SectionWrapper>
    </RootWrapper>
  )
}

export default ReputationBoostrapper
