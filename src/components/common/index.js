import styled from 'styled-components'

export const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 80%;
`
export const CircleAndTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const Icon = styled.img`
  width: 20px;
  height: 20px;
`

export const Instruction = styled.div`
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  margin-top: 16px;
  color: var(--enable-purple-text);
`

// TODO include SF Pro Text font
export const SubInstruction = styled.div`
  font-family: SF Pro Text;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.4px;
  color: var(--enable-purple-border);
`

export const Title = styled.div`
  display: flex;
  flex-direction: row;
  color: var(--white-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  text-align: left;
  margin: 0px 0px 0px 20px;
  letter-spacing: 1px;
`

export const Subtitle = styled(Title)`
font-size: 14px;  
color: var(--inactive-header-text);
`

export const Button = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 34px;
  margin: 0px 24px;
  background: var(--action-button);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 18px;
  color: var(--white-text);
  cursor: pointer;
`

export const DisableButton = styled(Button)`
  border: 1px solid var(--inactive-border);
  color: var(--inactive-header-text);
  background: none;
  cursor: default;
`