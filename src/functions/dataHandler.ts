import { computed, ref } from 'vue'
import * as Excel from 'exceljs'
import { type Moderatoren, type Moderator, getCellValue } from '@/types/Moderatorenliste'
import { countModerators } from '@/functions/dictionaryCounter'
import { isHoliday } from 'feiertagejs'

export default class DataHandler {
  private workbookAnwesenheit = ref<Excel.Workbook>()
  private workbookModeratoren = ref<Excel.Workbook>()

  public moderatoren = ref<Moderator[]>([])
  public bachelorModeratoren = ref<string[]>([])

  public mod1 = ref<string>('')
  public mod2 = ref<string>('')

  static dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  public dateObj = ref<string>(new Date().toLocaleDateString('de-DE', DataHandler.dateOptions))
  public group = ref<string>('')

  public handleFileSelected = (file: File) => {
    const reader = new FileReader()

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer)
      this.workbookAnwesenheit.value = new Excel.Workbook()
      this.workbookAnwesenheit.value.xlsx.load(uint8Array).catch((error) => {
        console.error('Fehler beim Einlesen der Datei:', error)
      })
    }
    reader.readAsArrayBuffer(file)
  }

  public handleModeratorenlist = (file: File) => {
    const reader = new FileReader()

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer)
      this.workbookModeratoren.value = new Excel.Workbook()
      this.workbookModeratoren.value.xlsx
        .load(uint8Array)
        .then(() => {
          if (this.workbookModeratoren.value === undefined) return

          const worksheet = this.workbookModeratoren.value.getWorksheet(1)
          const rows = worksheet.getRows(9, 17)

          if (rows === undefined) return

          const moderators: Moderatoren[] = rows.map((row) => {
            const date = new Date(getCellValue(row, 7))
            const datestring = date.toLocaleDateString('de-DE', DataHandler.dateOptions)
            return {
              date: datestring,
              moderator1: getCellValue(row, 8),
              moderator2: getCellValue(row, 9)
            }
          })

          this.moderatoren.value = countModerators(moderators)

          const keys = Object.keys(worksheet.getColumn(5).values)
          for (const key of keys) {
            const forname = worksheet.getCell(key, 2).value?.toString()
            const name = worksheet.getCell(key, 1).value?.toString()

            if (forname === undefined || name === undefined) continue

            this.bachelorModeratoren.value.push(forname.concat(' ', name))
          }
        })
        .catch((error) => {
          console.error('Fehler beim Einlesen der Datei:', error)
        })
    }
    reader.readAsArrayBuffer(file)
  }

  public getPeople = computed(() => {
    const people: string[] = []
    if (this.workbookAnwesenheit.value === undefined) return []
    if (!this.workbookAnwesenheit.value) return []

    const worksheetnames = this.workbookAnwesenheit.value.worksheets.map((elem) => elem.name)
    for (const worksheetname of worksheetnames) {
      const cellWithName = this.findCellWithParameter('Name', worksheetname)
      const cellWithForname = this.findCellWithParameter('Vorname', worksheetname)

      const worksheet = this.workbookAnwesenheit.value.getWorksheet(worksheetname)

      if (!cellWithName || !cellWithForname) return []

      const parts = this.dateObj.value.split('.')
      const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}`
      const chosenDate = new Date(isoDateString)
      console.log(chosenDate.getDay())
      if (chosenDate.getDay() % 6 === 0 || isHoliday(chosenDate, 'BW')) {
        return []
      }

      let cellWithDate: Excel.Cell = worksheet.getCell('A1')
      const rowNumber = parseInt(cellWithName.row)
      const rows = worksheet.getRow(rowNumber)
      const cellCount = rows.cellCount

      for (let index = 1; index <= cellCount; index++) {
        const text = rows.getCell(index).value?.toString()
        if (!text) return []
        const date = new Date(text)

        if (date.toLocaleString('de-DE', DataHandler.dateOptions) === this.dateObj.value)
          cellWithDate = rows.getCell(index)
      }

      const columnName = worksheet.getColumn(cellWithName.col)
      const startindex = parseInt(cellWithName.row)

      // const leastLength = Math.min(...[columbName.values.length, columnForname.values.length, columnDate.values.length])
      for (let index = startindex; index <= columnName.values.length; index++) {
        if (worksheet.getCell(index, cellWithDate.col).value?.toString() === undefined) {
          const forname = worksheet.getCell(index, cellWithForname.col).value?.toString()
          const name = worksheet.getCell(index, cellWithName.col).value?.toString()

          if (!forname || !name || forname === name) continue

          people.push(forname.concat(' ', name))
        }
      }
    }
    return people
  })

  public findCellWithParameter = (parameter: string, worksheetname: string): Excel.Cell | null => {
    if (!this.workbookAnwesenheit.value || this.workbookAnwesenheit.value === undefined) return null

    const worksheet = this.workbookAnwesenheit.value.getWorksheet(worksheetname)

    const numberOfRows = worksheet.rowCount
    const rows = worksheet.getRows(0, numberOfRows) ?? []

    // Durchlaufe alle Zeilen im Arbeitsblatt
    for (let row of rows) {
      // Durchlaufe alle Zellen in der aktuellen Zeile
      const cellcount = row.cellCount
      for (let index = 1; index <= cellcount; index++) {
        // Überprüfe, ob der Zellenwert mit dem Parameter übereinstimmt
        const cell = row.getCell(index)
        if (cell.value === parameter) {
          return cell
        }
      }
    }

    return null // Zelle nicht gefunden
  }

  public newdate = (newdate: string) => {
    const date = new Date(newdate)
    console.log(date)
    this.dateObj.value = date.toLocaleString('de-DE', DataHandler.dateOptions)
  }

  public highestMod = computed(() => {
    return this.moderatoren.value.sort((a, b) => b.amount - a.amount)[0].amount
  })

  public filterPeople = computed(() => {
    if (this.getPeople.value.length === 0 || this.moderatoren.value.length === 0) return []

    let filteredPeople = this.getPeople.value
    let moderatorNamen: string[] = this.moderatoren.value.map((moderator) => moderator.moderator)

    // Alle bachelorstudenten entfernen:
    console.log('GROUP:', this.group.value)
    if (this.group.value === 'Bachelorstudenten auslassen')
      filteredPeople = filteredPeople.filter(
        (person) =>
          !this.bachelorModeratoren.value.some((_moderator: string) => _moderator === person)
      )

    // Alle bereits moderierten Namen entfernen
    filteredPeople = filteredPeople.filter(
      (person) => !moderatorNamen.some((_moderator: string) => _moderator === person)
    )

    // Only one flag so it's sure this last person gets chosen
    let only_one = ''
    if (filteredPeople.length < 2) {
      if (filteredPeople.length === 1) only_one = filteredPeople[0]

      for (let presentations = 2; presentations <= this.highestMod.value; presentations++) {
        const moderatorNamen: string[] = this.moderatoren.value
          .filter((moderator) => moderator.amount < presentations)
          .map((moderator) => moderator.moderator)
        filteredPeople = filteredPeople.concat(moderatorNamen)
        if (filteredPeople.length > 1) break
      }
    }

    const returnlist = filteredPeople.slice()
    if (only_one !== '') {
      this.mod1.value = only_one
      filteredPeople.splice(
        filteredPeople.findIndex((person) => person === only_one),
        1
      )
    } else {
      const index1 = Math.floor(Math.random() * filteredPeople.length)
      this.mod1.value = filteredPeople[index1]
      filteredPeople.splice(index1)
    }
    this.mod2.value = filteredPeople[Math.floor(Math.random() * filteredPeople.length)]
    return returnlist
  })

  // compute list of people that are in filtered people but is not mod
  public modlistForMod = (mods: string[]): string[] => {
    return this.filterPeople.value.filter((person) => !mods.includes(person))
  }
}
