import React from 'react'
import styled from 'styled-components'
import './Table.scss'

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 220px;
  overflow: auto;
`

export const RowWrapper = styled.div`
  border-bottom: 1px solid var(--border);
`

export const InactiveRowWrapper = styled.div`
  border-bottom: 1px solid var(--faded-border);
`

export const Row = styled.div`
  width: 100% - 10px;
  margin-left: 10px;
  display: flex;
  flex-direction: row;
  height: 39px;
`

export const CellWrapper = styled.div`
  width: ${props => props.width};
  text-align: ${props => props.align};
  color: var(--white-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 39px;
`

export const GreyCell = styled(CellWrapper)`
  color: var(--inactive-text)
`

const Table = ({ highlightTopRow, columns, data }) => (
  <React.Fragment>
    <RowWrapper>
      <Row>
        {columns.map(column => (
          <GreyCell width={column.width} align={column.align}>
            {column.name}
          </GreyCell>
        ))}
      </Row>
    </RowWrapper>
    <TableWrapper>
      {data.map((row, index) => {
        const highlight = !highlightTopRow || index === 0
        const Cell = highlight ? CellWrapper : GreyCell
        const Wrapper = highlight ? RowWrapper : InactiveRowWrapper
        return (
          <Wrapper>
            <Row>
              {columns.map(column => (
                <Cell width={column.width} align={column.align}>
                  {row[column.key]}
                </Cell>
              ))}
            </Row>
          </Wrapper>
        )
      })}
    </TableWrapper>
  </React.Fragment>
)

export default Table
