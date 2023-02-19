import { US_CT_TIMEZONE } from "../modules/constants";
import {zonedTimeToUtc} from "date-fns-tz";

/**
 * this is the function that converts the numbers to xxx-yyy-zzzz.
 * @param numString
 * @returns {string[]}
 */
 export function retrieveNumListWithHyphen(numString: any) {
    numString = numString.trim().replaceAll('-', '');

    while (numString.includes("  ")) {
      numString = numString.replace("  ", " ")
    }
    while (numString.includes("\n\n")) {
      numString = numString.replace("\n\n", "\n")
    }
    numString = numString.replace(/\, /g, ",")
    numString = numString.replace(/\ /g, "\n")
    numString = numString.replace(/\n/g, ",")

    let numberReg = RegExp('\\d{10}|\\d{3}\\-\\d{3}\\-\\d{4}$')
    let numStrWithHyphen = ""
    let numList = numString.split(",")

    for (let num of numList) {
      if (numStrWithHyphen !== '')
        numStrWithHyphen += ','

      if (numberReg.test(num) && !num.includes("-")) {
        numStrWithHyphen += num.substring(0, 3) + "-" + num.substring(3, 6) + "-" + num.substring(6, Math.max(6, num.length))
      } else {
        numStrWithHyphen += num
      }
    }

    return numStrWithHyphen.split(",")
  }


/**
 * this is the function that converts the numbers from numbers string to array list.
 * @param numString
 * @returns {*}
 */
export function retrieveNumList(numString: string) {
  numString = numString.replace(/\-/g, "")

  while (numString.includes("  ")) {
    numString = numString.replace("  ", " ")
  }
  numString = numString.replace(/\, /g, ",")
  numString = numString.replace(/\ /g, "\n")
  numString = numString.replace(/\n/g, ",")
  return numString.split(",")
}

/**
 * convert UTC Date String(YYYY-MM-DD) to Centeral Date String of USA (MM/DD/YYYY)
 * @param strDateTime
 */
 export function fromUTCDateStrToCTDateStr(utcDateStr: string) {
  let tempArr = utcDateStr.split("-")
  return tempArr[1] + "/" + tempArr[2] + "/" + tempArr[0]
}

/**
 * handle change event.
 * @param ev
 * @param state
 * @returns {*}
 */
 export function handle_change(ev: Event, state: any[]) {
  let name = (ev.target as HTMLInputElement).name.split("_");
  let index: number = Number(name[1]);
  let newArray = state.map(function (arr) {return arr.slice();});
  newArray[index] = (ev.target as HTMLInputElement).value;
  return newArray;
}

/**
 * return if the current is daylight saving time or not
 */
 export function isCurrentDayLightSavingTime() {

  // let localTime = new Date(2020, 11, 5, 10, 20)
  let localTime = new Date()
  let localTimeValue = localTime.getTime() - (localTime.getTime() % 1000)
  let localTimezoneOffsetValue = localTime.getTimezoneOffset() * 60 * 1000

  let utcTime = new Date( localTimeValue + localTimezoneOffsetValue)
  let ctTimeString = localTime.toLocaleString("en-US", {timeZone: US_CT_TIMEZONE});
  let ctTime = new Date(ctTimeString)

  let hourOffest = (utcTime.getTime() - ctTime.getTime()) / 1000 / 3600

  if (hourOffest === 5)
    return true

  return false
}


/**
 * handle cpr value
 * @param ev
 * @param state
 * @returns {*}
 */
 export function handle_value_cpr(ev: Event, state: any[]) {
  let indexes = (ev.target as HTMLInputElement).name.split("_");
  let newArray = state.map(function (arr) {
    return arr.slice();
  });

  let row = Number(indexes[0]);
  let col = Number(indexes[1]);
  newArray[row][col] = (ev.target as HTMLInputElement).value;
  if (row === newArray.length - 1 && col === newArray[0].length - 1 && (ev.target as HTMLInputElement).value) {
    newArray.push(Array(8).fill(""));
  }

  return newArray;
}

/**
 * handle cpr value
 * @param ev
 * @param state
 * @returns {*}
 */
 export function handle_value_lad(ev: Event, state: any[], row: number, col: number) {
  let newArray = state.map(function (arr) {
    return arr.slice();
  });

  newArray[row][col] = (ev.target as HTMLInputElement).value;
  if (row === newArray.length-1 && col === newArray[0].length - 1 && (ev.target as HTMLInputElement).value) {
    newArray.push(Array(8).fill(""));
  }

  return newArray;
}

/**
 * insert a row to indicated row
 * @param data
 * @param rowIndex
 * @returns {*}
 */
 export function insert_row(data: any[], rowIndex = -1) {
  let newArray = data.slice(0);

  if (rowIndex == -1) { rowIndex = data.length; }
  newArray.splice(rowIndex, 0, Array(data[0].length).fill(""));

  return newArray;
}

/**
 * convert Centeral Time of USA to UTC String(YYYY-MM-DDTHH:mmZ)
 * @param strDateTime
 */
 export function fromCTTimeToUTCStr(ctTime: Date) {

  let year = ctTime.getFullYear()
  let month: any = ctTime.getMonth() + 1
    if (month < 10) month = '0' + month
  let date: any = ctTime.getDate()
    if (date < 10)  date = '0' + date

  let hour: any = ctTime.getHours()
    if (hour < 10)  hour = '0' + hour
  let minute: any = ctTime.getMinutes()
    if (minute < 10)  minute = '0' + minute

  const ctTimeString = year + '-' + month + '-' + date + ' ' + hour + ':' + minute

  // convert from CT to UTC
  const utcTime = zonedTimeToUtc(ctTimeString, US_CT_TIMEZONE)

  // get UTC string of the type "YYYY-MM-DDTHH:mmZ"
  const strUTCDate = getUTCString(utcTime)

  return strUTCDate
}

/**
 * return UTC string
 */
 export function getUTCString(dt: Date, isStandFormat = true, bExistSec = false) {

  let year = dt.getUTCFullYear()
  let month: any = dt.getUTCMonth() + 1
  if (month < 10) month = '0' + month
  let date: any = dt.getUTCDate()
  if (date < 10)  date = '0' + date

  let hour: any = dt.getUTCHours()
  if (hour < 10)  hour = '0' + hour
  let minute: any = dt.getUTCMinutes()
  if (minute < 10)  minute = '0' + minute
  let second: any = dt.getUTCSeconds()
  if (second < 10) second = '0' + second

  let strShowDate: any = year + '-' + month + '-' + date
  if (isStandFormat)
    strShowDate += 'T'
  else
    strShowDate += ' '

  strShowDate += hour + ':' + minute
  if (bExistSec)
    strShowDate += ':' + second

  if (isStandFormat)
    strShowDate += 'Z'

  return strShowDate
}

/**
 * convert Centeral Time(MM/DD/YYYY HH:mm A) of USA to UTC String(YYYY-MM-DDTHH:mmZ)
 * @param strDateTime
 */
 export function fromCTStrToUTCStr(strDateTime: string) {

  if (strDateTime === undefined || strDateTime == null || strDateTime === '')   return ""

  // parse the year, month, date, hour, minute
  let [month, date, year] = strDateTime.split(" ")[0].split("/")
  let hour: any = Number(strDateTime.split(" ")[1].split(":")[0])
  let minute = Number(strDateTime.split(" ")[1].split(":")[1])
  let am = strDateTime.split(" ")[2]

  hour = parseInt(hour, 10)
  hour = hour % 12
  if (am === "PM")
    hour += 12
  if (hour < 10)
    hour = '0' + hour

  // config the date time string of CT of USA
  let ctTimeString = year + '-' + month + '-' + date + ' ' + hour + ':' + minute

  // get local time from CT
  const localTime = zonedTimeToUtc(ctTimeString, US_CT_TIMEZONE)

  // get UTC string of the type "YYYY-MM-DDTHH:mmZ"
  const strUTCDate = getUTCString(localTime)

  return strUTCDate
}
