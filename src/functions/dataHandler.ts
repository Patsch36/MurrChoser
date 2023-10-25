import { computed, ref } from 'vue'
import * as Excel from 'exceljs'
import { type Moderatoren, type Moderator, getCellValue } from '@/types/Moderatorenliste'
import { countModerators } from '@/functions/dictionaryCounter'
import { isHoliday } from 'feiertagejs'


/**
   * Class that handles the data for the MurrChoser application.
   */
export default class DataHandler {
  
  /**
   * Ref to the workbook containing the attendance data.
   */
  private workbookAnwesenheit = ref<Excel.Workbook>()
  /**
   * Ref to the workbook containing the moderators data.
   */
  private workbookModeratoren = ref<Excel.Workbook>()

  /**
   * Ref to an array of moderators.
   */
  public moderatoren = ref<Moderator[]>([])
  /**
   * Ref to an array of bachelor moderators.
   */
  public bachelorModeratoren = ref<string[]>([])

  /**
   * Ref to an array of manual selected Mods.
   */
  public manualSelected = ref<string[]>([])

  /**
   * Ref to the first moderator.
   */
  public mod1 = ref<string>('')
  /**
   * Ref to the second moderator.
   */
  public mod2 = ref<string>('')

  /**
   * Options for formatting dates.
   */
  static dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  /**
   * Ref to the selected date.
   */
  public dateObj = ref<string>(new Date().toLocaleDateString('de-DE', DataHandler.dateOptions))
  /**
   * Ref to the selected group.
   */
  public group = ref<string>('')
  /**
   * Ref to the selected group2.
   */
  public group2 = ref<string>('')

  /**
   * Ref to the time in minutes to prepare the moderation.
   */
  public prepareTime = ref<number>(14);
  /**
   * Ref to the number of misses allowed in the preparation time.
   */
  public missesInPrepareTime = ref<number>(5);
  /**
   * Ref to the number of days after presetnation without Exams.
   */
  public afterTime = ref<number>(25);

  /**
   * Handles the selected file by reading it as an array buffer and loading it into the workbookAnwesenheit property.
   * @param file - The selected file to be loaded.
   */
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


  /**
   * Handles the selected file by reading it as an array buffer and loading it into the workbookModeratoren property.
   * It then extracts the moderators and bachelor moderators from the loaded file.
   * @param file - The selected file to be loaded.
   */
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
          // TODO Make this dynamic
          const rows = worksheet.getRows(9, 30)

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

  /**
   * Computed property that returns an array of people who are present on the selected date.
   * It iterates through all worksheets in the workbookAnwesenheit property and extracts the names of people who are present on the selected date.
   * @returns An array of strings representing the names of people who are present on the selected date.
   */
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
      //console.log(chosenDate.getDay())
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

/**
 * Finds the first cell in the specified worksheet that contains the given parameter.
 * @param parameter - The value to search for in the worksheet.
 * @param worksheetname - The name of the worksheet to search in.
 * @returns The first cell that contains the given parameter, or null if no cell is found.
 */
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


  /**
   * Updates the selected date to the given new date.
   * @param newdate - The new date to be set.
   */
  public newdate = (newdate: string) => {
    const date = new Date(newdate)
    this.dateObj.value = date.toLocaleString('de-DE', DataHandler.dateOptions)
  }


  /**
   * Computed property that returns the highest amount of moderations done by a moderator.
   * It sorts the moderators array by amount of moderations in descending order and returns the amount of the first moderator in the sorted array.
   * @returns The highest amount of moderations done by a moderator.
   */
  public highestMod = computed(() => {
    return this.moderatoren.value.sort((a, b) => b.amount - a.amount)[0].amount
  })

/**
 * Computed property that filters the list of people who are present on the selected date and removes those who have already moderated.
 * It also removes bachelor students if the group property is set to 'Bachelorstudenten auslassen'.
 * It then filters out people who are not available for preparation using the filterPeopleNotAvailableForPreparation method.
 * Finally, it randomly selects two people from the filtered list to be moderators and sets them to the mod1 and mod2 properties.
 * @returns An array of strings representing the filtered list of people who can be moderators.
 */
  public filterPeople = computed(() => {
    if (this.getPeople.value.length === 0 || this.moderatoren.value.length === 0) return []

    let filteredPeople = this.getPeople.value.filter((person) => !this.manualSelected.value.includes(person))
    let moderatorNamen: string[] = this.moderatoren.value.map((moderator) => moderator.moderator)

    // Alle bachelorstudenten entfernen:
    //console.log('GROUP:', this.group.value)
    if (this.group.value === 'Bachelorstudenten auslassen')
      filteredPeople = filteredPeople.filter(
        (person) =>
          !this.bachelorModeratoren.value.some((_moderator: string) => _moderator === person)
      )

    // Alle bereits moderierten Namen entfernen
    filteredPeople = filteredPeople.filter(
      (person) => !moderatorNamen.some((_moderator: string) => _moderator === person)
    )

    // Filter first year
    if (this.group2.value === 'Ohne 1. Lehrjahr')
    {
      let firstYearPeople = this.findFirstYearPeople(filteredPeople)
      filteredPeople = filteredPeople.filter(person => !firstYearPeople.includes(person)) 
    }

    filteredPeople = this.filterPeopleNotAvailableForPreparation(filteredPeople)
    
    console.log('filteredPeople', filteredPeople)

    // Only one flag so it's sure this last person gets chosen
    let only_one = ''
    if (filteredPeople.length < 2) {
      if (filteredPeople.length === 1) only_one = filteredPeople[0]

      for (let presentations = 2; presentations <= this.highestMod.value; presentations++) {
        let moderatorNamen: string[] = this.moderatoren.value
          .filter((moderator) => moderator.amount < presentations)
          .map((moderator) => moderator.moderator)
        moderatorNamen = this.filterPeopleNotAvailableForPreparation(moderatorNamen)  
        filteredPeople = filteredPeople.concat(moderatorNamen)
        if (filteredPeople.length > 1) break
      }
    }

    const returnlist = filteredPeople.slice()
    if (only_one !== '') {
      this.mod1.value =  only_one
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

  /**
   * Computes a list of people who are in the filtered list of people but are not already moderators.
   * @param mods - An array of strings representing the names of current moderators.
   * @returns An array of strings representing the names of people who are in the filtered list of people but are not already moderators.
   */
  public modlistForMod = (mods: string[]): string[] => {
    return this.filterPeople.value.filter((person) => !mods.includes(person))
  }

/**
 * Filters out people who are not available for preparation based on the number of missed days in the past two weeks.
 * It loops through all worksheets in the workbookAnwesenheit property and counts the number of missed days for each person in the filteredPeople array.
 * If a person has missed more than the number of days specified in the missesInPrepareTime property, they are removed from the filteredPeople array.
 * @param filteredPeople - An array of strings representing the names of people who are present on the selected date and have not already moderated.
 * @returns An array of strings representing the names of people who are available for preparation and can be moderators.
 */
  private filterPeopleNotAvailableForPreparation = (filteredPeople: string[]) => {
    //console.log('filterPeopleNotAvailableForPreparation', filteredPeople, typeof this.missesInPrepareTime.value)
    if (this.workbookAnwesenheit.value === undefined || this.dateObj.value === undefined) return filteredPeople
    // get date two weeks before this.dateObj.value
    console.log(this.dateObj.value)
    const day = parseInt(this.dateObj.value.split('.')[0])
    const month = parseInt(this.dateObj.value.split('.')[1])
    const year = parseInt(this.dateObj.value.split('.')[2])
    // TODO just wor in second half of the year cause of magic number 30 as day count for mounths
    const startDay = day >= this.prepareTime.value ? day - this.prepareTime.value : 30 + day - this.prepareTime.value
    const startMonth = day >= this.prepareTime.value ? month : month - 1 % 12
    const startYear = month !== startMonth ? year : year - 1
    const endDay =  (day + this.afterTime.value) >= 30 ? -(30 - day - this.afterTime.value) : day + this.afterTime.value
    const endMonth = (day + this.afterTime.value) <= 30 ? month : month + 1 % 12
    const endYear = year //month !== endMonth ? year : year + 1
    console.log(endDay, endMonth, endYear)
    // GetMoth of dateTwoWeeksBefore
    const startWorksheetNumber = Math.ceil((startMonth ) / 2)-1;
    const endWorksheetNumber = Math.ceil((month) / 2)-1;

    //console.log(startWorksheetNumber, endWorksheetNumber)

    const adder = (month:number, year:number) => { return month % 2 === 1 ? 0 : (new Date(year, month, 0)).getDate();}

    let remover: string[] = []
    // Loop through filteredPeople
    for(let i = 0; i < filteredPeople.length; i++) {
      const person = filteredPeople[i]
      const removeIndex = filteredPeople.indexOf(person)
      if(removeIndex === -1) continue

      let counterMissedDays = 0;

      // Loop through all worksheets in workbook
      for (let j = startWorksheetNumber; j <= endWorksheetNumber; j++) {
        const worksheet = this.workbookAnwesenheit.value.worksheets[j]
        const delimiter = startWorksheetNumber === endWorksheetNumber ? day + adder(month, year) + 5  : j == startMonth ? worksheet.getRow(7).actualCellCount : 5 + day
        const start = startDay + 5 + adder(startMonth, startYear)
        const end = startWorksheetNumber === endWorksheetNumber ? endDay + adder(endMonth, endYear) : j == endMonth ? worksheet.getRow(7).actualCellCount :  5 + endDay  
        const actDate = day + 5 +  adder(month, year)

        // Find cell adress of person
        // TODO optimate because people with identival names cause problems
        const cell = this.findCellWithParameter(person.split(' ')[1], worksheet.name)
        if(cell === null) continue

        for(let k = start; k < delimiter; k++) {
          if (worksheet.getCell(cell.row, k).value !== null && worksheet.getCell(cell.row, k).value !== ' ') {
            counterMissedDays++
            // console.log(person, k, cell.row, worksheet.getCell(cell.row, k).value)

            if(counterMissedDays === this.missesInPrepareTime.value + 1) {
              console.log('Remove', person, 'from filteredPeople because of', counterMissedDays, 'missed days')
              remover.push(person)
              break
            }          
          }
        } 
        console.log(actDate, end)
        for(let k = actDate; k < end; k++){
            if(worksheet.getCell(cell.row, k).value == 'AP' || worksheet.getCell(cell.row, k).value == 'ZP') {
              console.log('Remove', person, 'from filteredPeople because of Exams on', this.afterTime.value, 'days after presentation date')
              remover.push(person)
              break
            } 
        }
      }
    }
    console.log("result", filteredPeople, remover)
    return filteredPeople.filter(person => !remover.includes(person))
  }

  private findFirstYearPeople = (filteredPeople : string[]) => {
    if (this.workbookAnwesenheit.value === undefined || this.dateObj.value === undefined) return filteredPeople
    const month = parseInt(this.dateObj.value.split('.')[1])
    const worksheet = this.workbookAnwesenheit.value.worksheets[Math.ceil((month) / 2)-1]
    let firstYearPeople : string[] = []
    console.log("filteredPeople.length:" , filteredPeople.length)
    for(let j = 0; j < filteredPeople.length; j++)
    {
        const cell = this.findCellWithParameter(filteredPeople[j].split(' ')[1], worksheet.name) 
        if(cell === null) continue
        console.log("cell:" , cell.row)
        var Lehrjahr = worksheet.getCell(cell.row , 3).value?.toString()
        console.log("Lehrjahr:" , Lehrjahr)
        if(Lehrjahr != undefined)
        {
          console.log("Lehrjahr:" , Lehrjahr)
          if(Lehrjahr.includes('1'))
          {
            const person = filteredPeople[j]
            console.log("Removed",  person , "because is in first year")
            firstYearPeople.push(person)
          }
        }
    }
    console.log("firstYearPeople: " , firstYearPeople)
    return firstYearPeople
  }

  /**
   * Handles manual selection of a name.
   * @param name - The name to be manually selected.
   */
  public handleManualSelection = (name: string) => {
    if (this.manualSelected.value.includes(name)) {
      this.manualSelected.value.splice(this.manualSelected.value.indexOf(name), 1)
    } else {
      this.manualSelected.value.push(name)
    }
  } 
}