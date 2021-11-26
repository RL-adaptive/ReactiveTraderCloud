import { broadcast } from "@finos/fdc3"
import styled, { css } from "styled-components"
import { TradeStatus } from "@/services/trades"
import {
  colConfigs,
  colFields,
  useTradeRowHighlight,
  useTableTrades,
} from "../TradesState"
import { TableHeadCellContainer } from "./TableHeadCell"
import { Virtuoso } from "react-virtuoso"
import { useRef } from "react"

const TableWrapper = styled.div`
  height: calc(100% - 4.75rem);
  overflow-x: scroll;
  overflow-y: scroll;
`
const Table = styled.table`
  background-color: ${({ theme }) => theme.core.lightBackground};
  position: relative;
  width: 100%;
  min-width: 60rem;
  border-collapse: separate;
  border-spacing: 0;

  .visually-hidden {
    display: none;
  }
`
const TableHead = styled.thead`
  font-size: 0.675rem;
  text-transform: uppercase;
`
const TableHeadRow = styled.tr`
  vertical-align: center;
  height: 2rem;
`

const highlightBackgroundColor = css`
  animation: ${({ theme }) => theme.flash} 1s ease-in-out 3;
`

const TableBodyRow = styled.tr<{ pending?: boolean; highlight?: boolean }>`
  height: 2rem;
  ${({ highlight }) => highlight && highlightBackgroundColor}
`

const TableBodyCell = styled.td<{
  numeric?: boolean
  rejected?: boolean
  relativeWidth?: number
}>`
  text-align: ${({ numeric }) => (numeric ? "right" : "left")};
  padding-right: ${({ numeric }) => (numeric ? "1.6rem;" : "0.1rem;")};
  position: relative;
  width: ${({ relativeWidth }) => `${relativeWidth}vw`};
  vertical-align: middle;
  &:before {
    content: " ";
    display: ${({ rejected }) => (rejected ? "block;" : "none;")};
    position: absolute;
    top: 50%;
    left: 0;
    border-bottom: 1px solid red;
    width: 100%;
  }
`
const StatusIndicator = styled.td<{ status?: TradeStatus }>`
  width: 18px;
  border-left: 6px solid
    ${({ status, theme: { accents } }) =>
      status === TradeStatus.Done
        ? accents.positive.base
        : status === TradeStatus.Rejected
        ? accents.negative.base
        : "inherit"};
`
const StatusIndicatorSpacer = styled.th`
  width: 18px;
  top: 0;
  position: sticky;
  background-color: ${({ theme }) => theme.core.lightBackground};
  border-bottom: 0.25rem solid ${({ theme }) => theme.core.darkBackground};
`

const VirtuosoTable = styled.div`
  [data-test-id] > div {
    &:nth-child(even) {
      background-color: ${({ theme }) => theme.core.darkBackground};
    }
    &:hover {
      background-color: ${({ theme }) => theme.core.alternateBackground};
    }
    height: 2rem;
  }
`

export const TradeGridRow: React.FC<any> = ({
  trade,
  highlightedRow,
  externalRef,
}) => {
  const tryBroadcastContext = (symbol: string) => {
    if (window.fdc3) {
      broadcast({
        type: "fdc3.instrument",
        id: { ticker: symbol },
      })
    }
  }

  return (
    <TableBodyRow
      key={trade.tradeId}
      highlight={trade.tradeId === highlightedRow}
      onClick={() => tryBroadcastContext(trade.symbol)}
    >
      <StatusIndicator status={trade.status} aria-label={trade.status} />
      {colFields.map((field, i) => (
        <TableBodyCell
          key={field}
          numeric={
            colConfigs[field].filterType === "number" && field !== "tradeId"
          }
          rejected={trade.status === "Rejected"}
          relativeWidth={colConfigs[field].width}
        >
          {colConfigs[field].valueFormatter?.(trade[field]) ?? trade[field]}
        </TableBodyCell>
      ))}
    </TableBodyRow>
  )
}

export const TradesGrid: React.FC<any> = ({ currentHeight }) => {
  const trades = useTableTrades()
  const highlightedRow = useTradeRowHighlight()
  const ref = useRef(null)

  return (
    <>
      <Table>
        <caption id="trades-table-heading" className="visually-hidden">
          Reactive Trader FX Trades Table
        </caption>
        <VirtuosoTable role="grid">
          <TableHead>
            <TableHeadRow>
              <StatusIndicatorSpacer scope="col" aria-label="Trade Status" />
              {colFields.map((field) => (
                <TableHeadCellContainer key={field} field={field} />
              ))}
            </TableHeadRow>
          </TableHead>
          {trades.length !== 0 && (
            //Pending to handle the height in order to
            //@ts-ignore
            <Virtuoso
              ref={ref}
              style={{ height: "200px", overflowY: "overlay" }}
              totalCount={trades.length}
              itemContent={(index) => (
                <TradeGridRow
                  trade={trades[index]}
                  highlightedRow={highlightedRow}
                  externalRef={ref}
                />
              )}
            />
          )}
          {trades.length === 0 && (
            <tbody role="grid">
              <TableBodyRow>
                <StatusIndicatorSpacer aria-hidden={true} />
                <TableBodyCell colSpan={colFields.length}>
                  No trades to show
                </TableBodyCell>
              </TableBodyRow>
            </tbody>
          )}
        </VirtuosoTable>
      </Table>
    </>
  )
}
