import * as Excel from 'exceljs'

export interface Moderatoren {
  date: string
  moderator1: string
  moderator2: string
}

export interface Moderator {
  moderator: string
  amount: number
}

const getCellValue = (row: Excel.Row, cellIndex: number) => {
  const cell = row.getCell(cellIndex)

  return cell.value ? cell.value.toString() : ''
}

export { getCellValue }
