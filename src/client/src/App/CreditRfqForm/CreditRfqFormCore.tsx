import { Subscribe } from "@react-rxjs/core"
import { FC } from "react"
import styled from "styled-components"
import { BuySellToggle } from "./BuySellToggle"
import { CounterPartySelection } from "./CounterPartySelection"
import { CreditInstrumentSearch } from "./CreditInstrumentSearch"
import { RfqButtonPanel } from "./RfqButtonPanel"
import { RfqParameters } from "./RfqParameters"

const CreditRfqFormCoreWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.core.lightBackground};
`

const CreditRfqHeader = styled.header`
  padding: 1em;
`

const CreditRfqContent = styled.div`
  padding: 10px 1em;
  flex: 1;

  & > *:not(:last-child) {
    margin-bottom: 1em;
  }
`

const CreditRfqFooter = styled.footer`
  padding: 1em;
  border-top: 1px solid ${({ theme }) => theme.primary.base};
`

export const CreditRfqFormCore: FC = () => {
  return (
    <CreditRfqFormCoreWrapper>
      <Subscribe fallback={<div>Loading...</div>}>
        <CreditRfqHeader>RFQ Ticket</CreditRfqHeader>
        <CreditRfqContent>
          <BuySellToggle />
          <CreditInstrumentSearch />
          <RfqParameters />
          <CounterPartySelection />
        </CreditRfqContent>
        <CreditRfqFooter>
          <RfqButtonPanel />
        </CreditRfqFooter>
      </Subscribe>
    </CreditRfqFormCoreWrapper>
  )
}
