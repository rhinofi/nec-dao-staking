// Libraries
import React from "react";
import jazzicon from "jazzicon";

// Utils
import Web3 from "web3";

// Settings
import BigNumber from "utils/bignumber"
export const BN = require('bn.js');


export const timeConstants = {
  inSeconds: {
    MONTH: 2592000,
    DAY: 86400,
    HOUR: 3600,
    MINUTE: 60,
    SECOND: 1
  }
}

export enum TimeMode {
  SECONDS,
  MINUTES_SECONDS,
  HOURS_MINUTES,
  DAYS_HOURS,
  MONTHS_DAYS
}

const { toBN, isAddress } = Web3.utils;

export const MAX_GAS = 0xffffffff;
export const MAX_UINT = Web3.utils.toTwosComplement('-1');
export const MAX_UINT_BN = new BigNumber(MAX_UINT)
export const MAX_UINT_DIVISOR = new BigNumber(2)
export const MAX_APPROVAL_THRESHOLD = MAX_UINT_BN.dividedToIntegerBy(MAX_UINT_DIVISOR)

const TEN18 = new BN('1000000000000000000');

export const WAD = TEN18

var padLeft = function (string, chars, sign) {
  return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
};

export function toChecksum(address) {
  return Web3.utils.toChecksumAddress(address)
}

export function getCurrentTime() {
  return Math.round((new Date()).getTime() / 1000)
}

export function toWei(value: string | BigNumber): string {
  return Web3.utils.toWei(value.toString())
}

export function fromWei(value: string | BigNumber): string {
  return Web3.utils.fromWei(value.toString())
}

export function isNumeric(num) {
  return !isNaN(num)
}

function getTimeModeByDuration(seconds: number): TimeMode {
  const { MONTH, DAY, HOUR, MINUTE, SECOND } = timeConstants.inSeconds
  let timeMode = TimeMode.SECONDS
  if (seconds > SECOND) {
    timeMode = TimeMode.SECONDS
  }

  if (seconds > MINUTE) {
    timeMode = TimeMode.MINUTES_SECONDS
  }

  if (seconds > HOUR) {
    timeMode = TimeMode.HOURS_MINUTES
  }

  if (seconds > DAY) {
    timeMode = TimeMode.DAYS_HOURS
  }

  if (seconds > MONTH) {
    timeMode = TimeMode.MONTHS_DAYS
  }
  return timeMode
}
export function formatTimeRemaining(seconds: number) {
  const { MONTH, DAY, HOUR, MINUTE, SECOND } = timeConstants.inSeconds
  const timeMode = getTimeModeByDuration(seconds)

  if (timeMode === TimeMode.SECONDS) {
    return `${seconds} ${secondText(seconds)}`
  }

  if (timeMode === TimeMode.MINUTES_SECONDS) {
    const minutesValue = Math.trunc(seconds / MINUTE)
    const secondsValue = seconds - (minutesValue * MINUTE)
    return `${minutesValue} ${minuteText(minutesValue)}, ${secondsValue} ${secondText(secondsValue)}`
  }

  if (timeMode === TimeMode.HOURS_MINUTES) {
    const hoursValue = Math.trunc(seconds / HOUR)
    const minutesValue = Math.trunc((seconds - (hoursValue * HOUR)) / MINUTE)
    return `${hoursValue} ${hourText(hoursValue)}, ${minutesValue} ${minuteText(minutesValue)}`
  }

}

function monthText(value) {
  return (value === 1 ? 'Month' : 'Months')
}

function dayText(value) {
  return (value === 1 ? 'Day' : 'Days')
}

function hourText(value) {
  return (value === 1 ? 'Hour' : 'Hours')
}

function minuteText(value) {
  return (value === 1 ? 'Minute' : 'Minutes')
}

function secondText(value) {
  return (value === 1 ? 'Second' : 'Seconds')
}

// These all truncate
function numDays(value) {
  // fullDays = value / days 
  // fullDays / DAY
}

function numHours(value) {
  // fullDays = value / days 
  // remainingTime = value % days
  // remainingHours = remainder / HOUR
}

function numMinutes(value) {
  // fullDays = value / days 
  // remainingTime = value % days
  // remainingTime = value % hours
  // remainingHours = remainder / MINUTE 
}

function numSecounds(value) {
  // fullDays = value / days 
  // remainingTime = value % days
  // remainingTime = value % hours
  // remainingTime = value % seconds
  // remainingHours = remainder / MINUTE
}

export function getNetworkNameById(id) {
  switch (id) {
    case "main":
    case "1":
      return "main";
    case "morden":
    case "2":
      return "morden";
    case "ropsten":
    case "3":
      return "ropsten";
    case "rinkeby":
    case "4":
      return "rinkeby";
    case "kovan":
    case "42":
      return "kovan";
    case "private":
    case "1512051714758":
      return "ganache";
    default:
      return `unknown (${id})`;
  }
}

export function getDurationTimeText(value) {
  const inSeconds = Number(value)
  const time = timeConstants.inSeconds

  if (inSeconds > time.DAY) {
    const days = 1
    const hours = 1
    return `${days} ${dayText(days)}, ${hours} ${hourText(hours)}`
  } else if (inSeconds <= time.DAY && inSeconds > time.HOUR) {
    const hours = 1
    const minutes = 1
    return `${hours} ${hourText(hours)}, ${minutes} ${minuteText(minutes)}`
  } else if (inSeconds <= time.HOUR && inSeconds > time.MINUTE) {
    const minutes = 1
    const seconds = 1
    return `${minutes} ${minuteText(minutes)}, ${seconds} ${secondText(seconds)}`
  } else if (inSeconds <= time.MINUTE) {
    const seconds = 1
    return `${seconds} ${secondText(seconds)}`
  }
}

export function tokenDisplay(value: BigNumber): string {
  return roundValue(Web3.utils.fromWei(value.toString()))
}

export function isZero(value: number | string): boolean {
  const bn = new BigNumber(value)
  return bn.isZero()
}

export function isPositiveNumber(value: number | string): boolean {
  const bn = new BigNumber(value)
  return bn.isPositive()
}

export function getDecimalPlaces(value: number | string): number {
  const bn = new BigNumber(value)
  return bn.decimalPlaces()
}

export function isLessThan(value1: number | string, value2: number | string): boolean {
  const bn1 = new BigNumber(value1)
  const bn2 = new BigNumber(value2)
  return bn1.isLessThan(bn2)
}

export function isGreaterThan(value1: number | string, value2: number | string): boolean {
  const bn1 = new BigNumber(value1)
  const bn2 = new BigNumber(value2)
  return bn1.isGreaterThan(bn2)
}

export function isEmpty(value) {
  if (value === undefined || value === null || value === '') {
    return false
  }
  return true
}

export function pow10(value) {
  const ten = new BigNumber(10)
  return ten.pow(value)
}

export function toAmount(value) {
  return toFixed(Web3.utils.fromWei(value))
}

export function toFixed(value) {
  const numValue = new BigNumber(value)
  const fixed = numValue.toPrecision(4)
  return fixed.toString()
}

export function fromRep(value) {
  const numValue = new BigNumber(value)
  const repValue = numValue.div(pow10(18))
  return roundValue(repValue.toString())
}

export function getSecondsText(value) {
  return `${value} seconds`
}

export function getMonthsSuffix(value) {
  const months = Number(value)
  if (months === 1) {
    return 'Month'
  }
  return 'Months'
}

export function getBatchText(value) {
  const months = Number(value)
  if (months === 1) {
    return 'Period'
  }
  return 'Periods'
}

export function timestampToDate(timestamp) {
  const dateObj = new Date(timestamp * 1000);
  const day = dateObj.getUTCDate()
  const month = dateObj.getUTCMonth()
  const year = dateObj.getUTCFullYear()

  return `${day}.${month + 1}.${year}`
}

export const formatDate = timestamp => {
  const date = new Date(timestamp * 1000);
  return `${date.toDateString()} ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
}

export const addZero = value => {
  return value > 9 ? value : `0${value}`;
}

export const fromRaytoWad = (x) => {
  return toBN(x).div(toBN(10).pow(toBN(9)));
}

export function toAddressStub(address) {
  const start = address.slice(0, 5)
  const end = address.slice(-3)

  return `${start}...${end}`
}

export function roundValue(value) {
  const decimal = value.indexOf('.')
  if (decimal === -1) {
    return value
  }
  return value.slice(0, decimal + 5)
}

export function hexToNumberString(value) {
  return Web3.utils.hexToNumberString(value)
}

export function fromFeeToPercentage(value) {
  const etherValue = Web3.utils.fromWei(value)
  const percentageValue = Number(etherValue) * 100
  return percentageValue
}

export function fromPercentageToFee(value) {
  const weiValue = new BN(Web3.utils.toWei(value, 'ether'))
  const feeValue = weiValue.div(new BN(100))
  return feeValue.toString()
}

export const copyToClipboard = e => {
  const value = e.target.title.replace(",", "");
  var aux = document.createElement("input");
  aux.setAttribute("value", value);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
  alert(`Value: "${value}" copied to clipboard`);
}

export const methodSig = method => {
  return Web3.utils.sha3(method).substring(0, 10)
}

export const generateIcon = (address) => {
  return jazzicon(28, address.substr(0, 10));
}
