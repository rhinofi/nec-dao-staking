import React, { Component } from 'react';
import styled from 'styled-components';
import { listAccounts } from '../../services/ledgerService';
import ActiveButton from './buttons/ActiveButton';
import { inject, observer } from 'mobx-react';
import { Wallet } from '../../stores/Provider';
import { Title } from './index';

const Modal = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 9999;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  & > div {
    position: relative;
    width: 450px;
    border: 1px solid var(--border);
    background-color: var(--background);
    padding: 30px 20px;
    color: var(--white-text);
    font-family: Montserrat;
    font-style: normal;
  }
`

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

const TopWrapper = styled.div`
  position: relative;
  display: flex;
  margin-bottom: 30px;
  align-items: center;
  
  label {
    margin-right: 30px;
  }
`

const Select = styled.select`
    -webkit-appearance: none;
    font-size: 11px;
    color: var(--white-text);
    font-family: inherit;
    display: inline-block;
    height: 34px;
    border-radius: 0;
    padding: 0 40px 0 15px;
    outline: none;
    background-color: var(--background);
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDEwIj48ZGVmcz48c3R5bGU+LmNscy0ye2ZpbGw6I2ZmZjt9PC9zdHlsZT48L2RlZnM+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjEuNDEgNC42NyAyLjQ4IDMuMTggMy41NCA0LjY3IDEuNDEgNC42NyIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSIzLjU0IDUuMzMgMi40OCA2LjgyIDEuNDEgNS4zMyAzLjU0IDUuMzMiLz48L3N2Zz4=);
    background-repeat: no-repeat;
    background-position: 95% center;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    font-weight: bold;
    border: 1px solid var(--border);
`

const Input = styled.input`
  -webkit-appearance: none;
    font-size: 11px;
    color: var(--white-text);
    display: inline-block;
    height: 34px;
    border-radius: 0;
    outline: none;
    background-color: var(--background);
    font-weight: bold;
    border: 1px solid var(--border);
    padding-left: 15px;
`

const ButtonWrapper = styled.div`
  width: 200px;
`

const CustomTitle = styled(Title)`
  margin-left: 0;
  margin-bottom: 30px;
`

const Close = styled.div`
  position: absolute;
  top: 0;
  right: 12px;
  font-size: 36px;
  color: var(--white-text);
  cursor: pointer;
  &:hover {
    color: var(--enable-purple-text)
  }
`

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
    let derivation = this.ledgerDerivation.value;
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
      <Modal>
        <div>
          <Close onClick={() => toggleModal()}>×</Close>
          {
            !this.state.ledgerConnected &&
            <CustomTitle>
              Please check if your ledger is connected...
            </CustomTitle>
          }
          <TopWrapper>
            <Select
              placeholder="Derivation"
              onChange={this.ledgerList}
              ref={(input) => { this.ledgerDerivation = input; }}
            >
              <option value="legacy">Legacy</option>
              <option value="live">Ledger Live</option>
              <option value="custom">Custom path</option>
            </Select>
            <ButtonWrapper>
              <ActiveButton onClick={() => this.ledgerList()}>
                Reload
              </ActiveButton>
            </ButtonWrapper>

          </TopWrapper>
          {
            this.ledgerDerivation &&
            this.ledgerDerivation.value === 'custom' &&
            <TopWrapper>
              <label>PATH</label>
              <Input
                className="modal-input"
                type="text"
                ref={(input) => { this.ledgerPath = input; }}
                onChange={ledgerListDebounced}
                defaultValue="44'/60'/0'/0"
              />
            </TopWrapper>
          }
          {
            this.state.ledgerConnected &&
            this.state.accounts.length === 0 &&
            this.state.loading &&
            <div>
              Loading...
            </div>
          }
          <div>
            {
              error &&
              <div>{error}</div>
            }
          </div>
          {
            this.state.accounts.length > 0 &&
            <React.Fragment>
              <LedgerAccoutsTable cellSpacing={0}>
                <thead>
                <MetaRow>
                  <th>Address</th>
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
                        <td>{acc.address}</td>
                      </tr>
                    ))
                  }
                  <MetaRow>
                    <td colSpan={3}>
                      {
                        (!this.ledgerDerivation || this.ledgerDerivation.value !== 'custom') &&
                        <Pagination>
                          <a onClick={() => this.paginateLedger(1)}>
                            More accounts
                          </a>
                          {
                            this.state.page > 0 &&
                            <a onClick={() => this.paginateLedger(-1)}>
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
        </div>
      </Modal>
    );
  }
}

export default LedgerAccountPicker;
