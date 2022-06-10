import { createCreditRfq } from "@/services/creditRfqRequests"
import { useCreditRfqs } from "@/services/creditRfqs"
import { Direction } from "@/services/trades"
import { bind } from "@react-rxjs/core"
import { createSignal } from "@react-rxjs/utils"
import { FC } from "react"
import { exhaustMap, filter, map, tap, withLatestFrom } from "rxjs/operators"
import styled from "styled-components"
import {
  selectedCounterpartyIds$,
  setSelectedCounterpartyIds,
  useSelectedCounterpartyIds,
} from "./CounterpartySelection"
import {
  selectedInstrumentId$,
  setSelectedInstrumentId,
  useSelectedInstrument,
} from "./CreditInstrumentSearch"
import { direction$, setDirection } from "./DirectionToggle"
import { quantity$, setQuantity, useQuantity } from "./RfqParameters"

const RfqButtonPanelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const ActionButton = styled.button`
  border-radius: 3px;
  user-select: none;
  padding: 0 0.7rem;
  height: 24px;
  font-size: 11px;
  font-weight: 500;
`

const ClearButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.primary.base};
`

const SendRfqButton = styled(ActionButton)<{ disabled?: boolean }>`
  background-color: ${({ theme }) =>
    theme.colors.spectrum.uniqueCollections.Buy.base};
  ${({ disabled }) => (disabled ? "opacity: 0.3" : "")}
`

const [rfqRequest$, sendRfq] = createSignal()
const [useRfqResponse, rfqResponse$] = bind(
  rfqRequest$.pipe(
    withLatestFrom(
      direction$,
      selectedInstrumentId$,
      quantity$,
      selectedCounterpartyIds$,
    ),
    filter(
      ([_, _direction, instrumentId, quantity, dealerIds]) =>
        instrumentId !== null && quantity.value > 0 && dealerIds.length > 0,
    ),
    map(([_, direction, instrumentId, quantity, dealerIds]) => ({
      instrumentId: instrumentId!,
      dealerIds,
      quantity: quantity.value,
      direction,
      expirySecs: 60,
    })),
    tap((r) => console.log(r)),
    exhaustMap((request) => createCreditRfq(request)),
  ),
  null,
)

export const RfqButtonPanel: FC = () => {
  const selectedInstrument = useSelectedInstrument()
  const quantity = useQuantity()
  const selectedCounterpartyIds = useSelectedCounterpartyIds()
  const rfqResponse = useRfqResponse()
  const rfqs = useCreditRfqs()

  console.log(rfqResponse)
  console.log(rfqs)

  const detailsMissing =
    selectedInstrument === null ||
    quantity.value === 0 ||
    selectedCounterpartyIds.length === 0

  const clearRfqTicket = () => {
    setDirection(Direction.Buy)
    setSelectedInstrumentId(null)
    setQuantity("")
    setSelectedCounterpartyIds([])
  }

  return (
    <RfqButtonPanelWrapper>
      <ClearButton onClick={clearRfqTicket}>Clear</ClearButton>
      <SendRfqButton onClick={() => sendRfq()} disabled={detailsMissing}>
        Send RFQ
      </SendRfqButton>
    </RfqButtonPanelWrapper>
  )
}
