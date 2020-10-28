import React, { Component } from 'react';
import { Modal, IconButton, Typography, Grid, Box, Button, TextField } from "@material-ui/core";
import styled from 'styled-components';
import { listAccounts } from '../../services/ledgerService';
import ActiveButton from './buttons/ActiveButton';
import { inject, observer } from 'mobx-react';
import { Wallet } from '../../stores/Provider';
import { Close } from "@material-ui/icons";
import { Title } from './beehive/Title'

const StyledModal = styled(Modal)`
  max-width: 1068px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  height: 815px;
  overflow-y: auto;
`;

const LedgerAccoutsTable = styled.table`
  width: 100%;
  text-align: right;
  font-size: 15px;
  tr{
    cursor: pointer;
    &:hover {
      background-color: var(--logo-background)
    }
    th {
      border-bottom: 1px solid var(--border);
      padding: 8px 5px;
      &:first-child {
        text-align: left;
      }
    }
    td {
      padding: 7px 5px;
      &:first-child {
        text-align: left;
      }
    }
  }
`;
const LedgerAccoutsTableOverflow = styled.div`
  max-height: 205px;
  overflow: auto;
`;
const MetaRow = styled.tr`
  background-color: transparent !important;
  cursor: default !important;
  font-size: 11px;
  text-transform: uppercase;
`;
const Pagination = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  padding-top: 10px;
  a {
    cursor: pointer;
    font-weight: bold;
    
    &:hover {
      color: var(--enable-purple-text);
    }
    i {
      margin: 0 5px; 
    }
  }
`;

const Select = styled.select`
  font-size: 14px;
  color: white;
  display: inline-block;
  height: 34px;
  border-radius: 0;
  padding: 0 40px 0 15px;
  outline: none;
  background-color: var(--background);
  text-transform: uppercase;
  -webkit-letter-spacing: 0.02em;
  -moz-letter-spacing: 0.02em;
  -ms-letter-spacing: 0.02em;
  letter-spacing: 0.02em;
  border: 1px solid var(--border);

  option {
    background-color: #222b42 !important;
  }
`

const ButtonWrapper = styled.div`
  width: 200px;
`

const BackgroundWrapper = styled.div`
  box-sizing: border-box;
  padding: 25px;
  background-color: #222b42;
  outline: none;
`;

const CloseIconContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const CloseIcon = styled(IconButton)`
  padding: 16px;
  color: #ffffff !important;
  font-size: 16px;
`;

const Subtitle = styled(Typography)`
  font-family: Montserrat;
`;

const BodyText = styled(Typography)`
  cursor: pointer;
`;



@inject('root')
@observer

class LedgerAccountPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: [],
      page: 0,
      ledgerConnected: false,
      loading: false,
      error: ''
    };

    this.ledgerList = this.ledgerList.bind(this);
    this.paginateLedger = this.paginateLedger.bind(this);
  }

  componentDidMount() {
    this.ledgerList();
  }

  debounce(func, wait, immediate) {
    let timeout;
    return function () {
      const context = this, args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  async listAddresses(path, page) {
    try {
      const addressesPerPage = 5;
      const accounts = await listAccounts(path, page * addressesPerPage, addressesPerPage);
      return accounts
    } catch (err) {
      if (err && err.message && (err.message === 'Sign failed' || err.message.indexOf('U2F DEVICE_INELIGIBLE'))) {
        this.setState({
          error: 'Please make sure your Ledger is unlocked'
        });
      } else {
        const { message } = err
        if (message.indexOf('6801') >= 0 || message.indexOf('6804') >= 0)
          this.setState({ error: 'Please make sure your Ledger is unlocked' });
        if (message.indexOf('6a80') >= 0)
          this.setState({ error: 'Please make sure you have "Contract Data" enabled in the Ethereum app on your Ledger' });
        if (message.indexOf('6985') >= 0)
          this.setState({ error: 'Confirmation denied' });
      }
      return [];
    }
  }

  async ledgerList() {
    this.setState({
      accounts: [],
      loading: true,
      error: ''
    });
    let derivation = this.ledgerDerivation? this.ledgerDerivation.value : 'legacy';
    if (derivation === 'custom')
      derivation = this.ledgerPath ? this.ledgerPath.value : `44'/60'/0'/0`;
    const accounts = await this.listAddresses(derivation, this.state.page);
    if (accounts)
      this.setState({
        accounts,
        ledgerConnected: true,
      });
    this.setState({ loading: false });
  }

  paginateLedger(increment) {
    if (this.state.page + increment < 0) return;
    this.setState({
        page: this.state.page + increment,
        accounts: [],
      },
      () => this.ledgerList()
    );
  }

  setPath(path, address) {
    window.ledgerData = {path, address}
    this.props.root.providerStore.setWallet(Wallet.LEDGER)
    this.props.toggleModal()
  }

  render() {
    const { toggleModal } = this.props
    const { error } = this.state
    const ledgerListDebounced = this.debounce(this.ledgerList, 500);

    return (
      <StyledModal
        open={true}
        aria-labelledby="ledger"
        disableAutoFocus={true}
      >
        <BackgroundWrapper>
          <CloseIconContainer>
            <CloseIcon onClick={() => toggleModal()}>
              <Close />
            </CloseIcon>
          </CloseIconContainer>
          <Box width='100%' paddingBottom='25px' display='flex' justifyContent='center'>
            <Title text={"Connect Ledger"} afterElement={true} />
          </Box>
          {
            !this.state.ledgerConnected &&
            <Box width='100%' padding='10px 0'>
              <Subtitle color='textSecondary' variant='body2' align='center'>
                Please check if your ledger is connected...
              </Subtitle>
            </Box>
          }
            <Grid container justify={'center'} style={{ paddingBottom: 25 }}>
              <Grid item>
              <Select
                placeholder="Derivation"
                onChange={this.ledgerList}
                ref={(input) => { 
                  console.log(input)  
                  this.ledgerDerivation = input
                }}
              >
                <option value="legacy">Legacy</option>
                <option value="live">Ledger Live</option>
                <option value="custom">Custom path</option>
              </Select>
              </Grid>

              <Grid item>
              <ButtonWrapper>
                <Button onClick={() => this.ledgerList()}>
                  Reload
                </Button>
              </ButtonWrapper>
              </Grid>
            </Grid>

          {
            this.ledgerDerivation &&
            this.ledgerDerivation.value === 'custom' &&
            <Grid container justify={'center'}>
              <Grid item>
                <Box paddingRight='25px'>
                  <BodyText variant={'body2'} color='textPrimary'>Path</BodyText>
                </Box>
              </Grid>
              <Grid item>
                <TextField
                  type="text"
                  ref={(input) => { this.ledgerPath = input; }}
                  onChange={ledgerListDebounced}
                  defaultValue="44'/60'/0'/0"
                />
              </Grid>
            </Grid>
          }
          {
            this.state.ledgerConnected &&
            this.state.accounts.length === 0 &&
            this.state.loading &&
            <Box width='100%' padding='10px 0'>
              <Subtitle color='textPrimary' variant='body2' align='center'>
                Loading...
              </Subtitle>
            </Box>
          }
          <div>
            {
              error &&
              <Box width='100%' padding='10px 0'>
                <Subtitle color='textSecondary' variant='body2' align='center'>{error}</Subtitle>
              </Box>
            }
          </div>
          {
            this.state.accounts.length > 0 &&
            <React.Fragment>
              <LedgerAccoutsTable cellSpacing={0}>
                <thead>
                <MetaRow>
                  <Subtitle color='textPrimary' variant='body2'>Address</Subtitle>
                </MetaRow>
                </thead>
              </LedgerAccoutsTable>
              <LedgerAccoutsTableOverflow>
                <LedgerAccoutsTable cellSpacing={0}>
                  <tbody>
                  {
                    this.state.accounts.map(acc => (
                      <tr key={acc.address}
                          onClick={() => this.setPath(acc.path, acc.address)}>
                        <td><BodyText variant={"body2"} color={'textPrimary'}>{acc.address}</BodyText></td>
                      </tr>
                    ))
                  }
                  <MetaRow>
                    <td colSpan={3}>
                      {
                        (!this.ledgerDerivation || this.ledgerDerivation.value !== 'custom') &&
                        <Pagination>
                          <a onClick={() => this.paginateLedger(1)} style={{ color: "#E2A907" }}>
                            More accounts
                          </a>
                          {
                            this.state.page > 0 &&
                            <a onClick={() => this.paginateLedger(-1)} style={{ color: "#E2A907" }}>
                              Previous accounts
                            </a>
                          }
                        </Pagination>
                      }
                    </td>
                  </MetaRow>
                  </tbody>
                </LedgerAccoutsTable>
              </LedgerAccoutsTableOverflow>
            </React.Fragment>
          }
        </BackgroundWrapper>
      </StyledModal>
    );
  }
}

export default LedgerAccountPicker;
