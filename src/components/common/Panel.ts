import styled from 'styled-components'

export const ValidationError = styled.div`
  text-align: left;
  color: var(--invalid-red);
  font-family: Montserrat;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  margin-bottom: -15px;
`

export const PanelWrapper = styled.div`
`

export const AmountLabelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between; 
`

export const AmountForm = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 18px;
  padding: 0px 20px 6px 20px;
  border-bottom: 1px solid var(--inactive-border);
  input {
    border: '1px solid #ccc';
    font-size: 15px;
    line-height: 18px;
    color: var(--white-text);
    background: var(--background);
    border: none;
    box-shadow: inset 0 0 0 1px var(--background), inset 0 0 0 100px var(--background);
    :-webkit-autofill,
    :-webkit-autofill:hover,
    :-webkit-autofill:focus,
    :-webkit-autofill:active, 
    :-internal-autofill-selected {
      -webkit-text-fill-color: var(--white-text);
    }
  }
`

export const MaxButton = styled.div`
  background: #E2A907;
  width: 12px;
  height: 12px;
  border-radius: 7px;
  margin-top: 3px;
  cursor: pointer;
  
`

