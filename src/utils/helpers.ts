// Libraries
import jazzicon from "jazzicon";

// Utils
import Web3 from "web3";

// Settings
import BigNumber from "utils/bignumber"
import { numeral, moment } from "utils/formatters"
export const BN = require('bn.js');

export interface FormStatus {
  isValid: boolean;
  errorMessage: string;
}

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

const { toBN } = Web3.utils;

export const MAX_GAS = 0xffffffff;
export const MAX_UINT = Web3.utils.toTwosComplement('-1');
export const MAX_UINT_BN = new BigNumber(MAX_UINT)
export const MAX_UINT_DIVISOR = new BigNumber(2)
export const MAX_APPROVAL_THRESHOLD = MAX_UINT_BN.dividedToIntegerBy(MAX_UINT_DIVISOR)

export const MILLION = new BigNumber(1000000)
export const THOUSAND = new BigNumber(1000)
export const ONE = new BigNumber(0)
export const MIN_VISIBLE_VALUE = new BigNumber(0.0001)
export const ZERO = new BigNumber(0)

const TEN18 = new BN('1000000000000000000');

export const WAD = TEN18

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

/* Display a token value with format based on it's wei value */
export function tokenDisplay(weiValue: BigNumber, round?: boolean): string {
  const tokenValue = divTen18(weiValue)

  if (tokenValue.eq(ZERO)) {
    return '0'
  }

  // Millions Format (M)
  if (tokenValue.gt(MILLION)) {
    return toMillions(tokenValue)
  }
  // Thousands Format (k)
  if (tokenValue.gt(THOUSAND)) {
    return toThousands(tokenValue)
  }

  if (tokenValue.gt(ONE)) {
    return toSubThousands(tokenValue)
  }

  // Standard Format (currency format, 4-digit decimal precision)
  if (tokenValue.gt(MIN_VISIBLE_VALUE)) {
    return toSubOne(tokenValue)
  }

  // Exponential Format
  else {
    return toExponential(tokenValue)
  }
}

function toMillions(tokenValue: BigNumber): string {
  const inMillions = tokenValue.div(MILLION)
  return numeral(inMillions.toFixed(6)).format('0,0.[0000]') + 'M'
}

function toThousands(tokenValue: BigNumber): string {
  // const inThousands = tokenValue.div(THOUSAND)
  return numeral(tokenValue.toFixed(6)).format('0,0.[000]')
}

function toSubThousands(tokenValue: BigNumber): string {
  return numeral(tokenValue.toFixed(4, BigNumber.ROUND_DOWN)).format('0.[0000]')
}

function toSubOne(tokenValue: BigNumber): string {
  console.log({
    fixed: tokenValue.toFixed(4, BigNumber.ROUND_DOWN),
    numeral: numeral(tokenValue.toFixed(4, BigNumber.ROUND_DOWN)).format('0.[000]')
  })
  return numeral(tokenValue.toFixed(4, BigNumber.ROUND_DOWN)).format('0.[0000]')
}

function toExponential(tokenValue: BigNumber): string {
  return tokenValue.toExponential()
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
    return true
  }
  return false
}

export function pow10(value) {
  const ten = new BigNumber(10)
  return ten.pow(value)
}

export function divTen18(value: BigNumber): BigNumber {
  return value.div(pow10(18))
}

export function toFixed(value) {
  const numValue = new BigNumber(value)
  return numValue.toString(10)
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

export const addZero = value => {
  return value > 9 ? value : `0${value}`;
}

export function toAddressStub(address) {
  const start = address.slice(0, 5)
  const end = address.slice(-3)

  return `${start}...${end}`
}

export function roundValue(value: string): string {
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

export const methodSig = method => {
  return Web3.utils.sha3(method).substring(0, 10)
}

export const generateIcon = (address) => {
  return jazzicon(28, address.substr(0, 10));
}

/*
 * must be a number
 * positive numbers only
 * <=18 decimals
 * must be filled in
 * must be <= to user balance
 * must be greater than a minimum contribution value (1 token)
 */

export const isValidTokenAmount = (value, maxValue, actionText: string): FormStatus => {

  if (isEmpty(value)) {
    return {
      isValid: false,
      errorMessage: "Please input a token value"
    }
  }

  if (!isNumeric(value)) {
    return {
      isValid: false,
      errorMessage: "Please input a valid number"
    }
  }

  if (isZero(value)) {
    return {
      isValid: false,
      errorMessage: `Cannot ${actionText} zero tokens`
    }
  }

  if (!isPositiveNumber(value)) {
    return {
      isValid: false,
      errorMessage: "Please input a positive number"
    }
  }

  if (getDecimalPlaces(value) > 18) {
    return {
      isValid: false,
      errorMessage: "Input exceeds 18 decimal places"
    }
  }

  if (isGreaterThan(value, maxValue)) {
    return {
      isValid: false,
      errorMessage: "Insufficent Balance"
    }
  }

  if (isLessThan(value, 1)) {
    return {
      isValid: false,
      errorMessage: `Minimum ${actionText} is one token`
    }
  }

  return {
    isValid: true,
    errorMessage: ""
  }
}