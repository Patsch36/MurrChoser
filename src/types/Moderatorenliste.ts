import * as Excel from 'exceljs'

export interface Moderator {
  date: string
  moderator1: string
  moderator2: string
}

const getCellValue = (row: Excel.Row, cellIndex: number) => {
  const cell = row.getCell(cellIndex)

  return cell.value ? cell.value.toString() : ''
}

export { getCellValue }
