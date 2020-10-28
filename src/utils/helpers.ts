// Libraries
import jazzicon from "jazzicon";

// Utils
import Web3 from "web3";

// Settings
import BigNumber from "utils/bignumber"
import moment from 'moment';
import { numeral } from "utils/formatters"
export const BN = require('bn.js');

export interface FormStatus {
  isValid: boolean;
  displayError: boolean;
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

interface Duration {
  inSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export enum TimeMode {
  SECONDS,
  MINUTES_SECONDS,
  HOURS_MINUTES,
  DAYS_HOURS
}

export const MAX_GAS = 0xffffffff;
export const MAX_UINT = Web3.utils.toTwosComplement('-1');
export const MAX_UINT_BN = new BigNumber(MAX_UINT)
export const MAX_UINT_DIVISOR = new BigNumber(2)
export const MAX_APPROVAL_THRESHOLD = MAX_UINT_BN.dividedToIntegerBy(MAX_UINT_DIVISOR)

export const TRILLION = new BigNumber('1000000000000')
export const BILLION = new BigNumber('1000000000')
export const MILLION = new BigNumber(1000000)
export const THOUSAND = new BigNumber(1000)
export const ONE = new BigNumber(1)
export const MIN_VISIBLE_VALUE = new BigNumber(0.0001)
export const ZERO = new BigNumber(0)
export const REAL_ONE = (new BigNumber(2)).exponentiatedBy(40)

const TEN18 = new BN('1000000000000000000');

export const WAD = TEN18

export function toChecksum(address) {
  return Web3.utils.toChecksumAddress(address)
}

export function getCurrentTime() {
  return Math.round((new Date()).getTime() / 1000)
}

export function toWeiValue(value: BigNumber): BigNumber {
  return value.times(TEN18)
}

export function toTokenValue(value: BigNumber): BigNumber {
  return value.div(TEN18)
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

export function safeDiv(num: BigNumber, denom: BigNumber) {
  if (num.eq(0)) return ZERO;
  if (denom.eq(0)) return ZERO;
  return num.div(denom);
}
/*
  @param zeroValue: Value that represents 0% 
  @param currentValue: Calculate % based on this value
  @param hundredValue: Value that reprsents 100%
  @return Percentage value
*/
export function getPercentage(zeroValue: number, currentValue: number, hundredValue: number): number {
  if (currentValue <= zeroValue) {
    return 0
  }

  if (currentValue >= hundredValue) {
    return 100
  }

  const numerator = currentValue - zeroValue
  const demoninator = hundredValue = currentValue
  return numerator / demoninator
}

export function timeUntil(timestamp: number): string {
  const timeUntil = moment(timestamp * 1000).fromNow()
  return timeUntil
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

  return timeMode
}
export function formatTimeRemaining(seconds: number): string {
  const timeMode = getTimeModeByDuration(seconds)
  const duration = secondsToDuration(seconds)

  if (timeMode === TimeMode.SECONDS) {
    return `<1m`
  }

  if (timeMode === TimeMode.MINUTES_SECONDS) {
    return `${duration.minutes}m`
  }

  if (timeMode === TimeMode.HOURS_MINUTES) {
    return `${duration.hours}h:${duration.minutes}m`
  }

  else {
    return `${duration.days}d:${duration.hours}h:${duration.minutes}m`
  }
}

export function parseTimeRemaining(seconds: number) {
  const timeMode = getTimeModeByDuration(seconds)
  const duration = secondsToDuration(seconds)
  return {
    timeMode,
    duration
  }
}

function secondsToDuration(inSeconds: number): Duration {
  const rawDuration = moment.duration(inSeconds, 'seconds')
  const days = rawDuration.days()
  const hours = rawDuration.hours()
  const minutes = rawDuration.minutes()
  const seconds = rawDuration.seconds()
  return {
    inSeconds: seconds,
    days,
    hours,
    minutes,
    seconds
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

export function blocksText(value) {
  return (value === 1 ? 'block' : 'blocks')
}

export function fromReal(value: BigNumber): BigNumber {
  return value.div(REAL_ONE)
}

/* Display a token value with format based on it's wei value */
export function tokenDisplay(weiValue: BigNumber, round?: boolean): string {
  const tokenValue = toTokenValue(weiValue)

  if (tokenValue.eq(ZERO)) {
    return '0'
  }

  if (tokenValue.gte(TRILLION)) {
    return toExponential(tokenValue)
  }

  if (tokenValue.gte(BILLION)) {
    return toBillions(tokenValue)
  }

  // Millions Format (M)
  if (tokenValue.gte(MILLION)) {
    return toMillions(tokenValue)
  }
  // Thousands Format (k)
  if (tokenValue.gte(THOUSAND)) {
    return toThousands(tokenValue)
  }

  if (tokenValue.gte(ONE)) {
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

function toBillions(tokenValue: BigNumber): string {
  const inMillions = tokenValue.div(MILLION)
  console.log({ tokenValue: tokenValue.toString(), inMillions: inMillions.toString() })
  return numeral(inMillions.toFixed(8, BigNumber.ROUND_DOWN)).format('0.[0]') + 'm'
}

function toMillions(tokenValue: BigNumber): string {
  // const inMillions = tokenValue.div(MILLION)
  return numeral(tokenValue.toFixed(10, BigNumber.ROUND_DOWN)).format('0,0.[0]')
}

function toThousands(tokenValue: BigNumber): string {
  // const inThousands = tokenValue.div(THOUSAND)
  return numeral(tokenValue.toFixed(3, BigNumber.ROUND_DOWN)).format('0,0.[000]')
}

function toSubThousands(tokenValue: BigNumber): string {
  return numeral(tokenValue.toFixed(3, BigNumber.ROUND_DOWN)).format('0.[000]')
}

function toSubOne(tokenValue: BigNumber): string {
  return numeral(tokenValue.toFixed(3, BigNumber.ROUND_DOWN)).format('0.[000]')
}

function toExponential(tokenValue: BigNumber): string {
  return tokenValue.toExponential(4)
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

export function toFixed(value: BigNumber): string {
  const numValue = new BigNumber(value)
  return numValue.toFixed(4, BigNumber.ROUND_DOWN)
}

export function fromRep(value) {
  const numValue = new BigNumber(value)
  const repValue = numValue.div(TEN18)
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
  return Web3.utils.sha3(method)!.substring(0, 10)
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
      displayError: false,
      errorMessage: ""
    }
  }

  if (!isNumeric(value)) {
    return {
      isValid: false,
      displayError: true,
      errorMessage: "Please input a valid number"
    }
  }

  if (isZero(value)) {
    return {
      isValid: false,
      displayError: true,
      errorMessage: `Cannot ${actionText} zero tokens`
    }
  }

  if (!isPositiveNumber(value)) {
    return {
      isValid: false,
      displayError: true,
      errorMessage: "Please input a positive number"
    }
  }

  if (getDecimalPlaces(value) > 18) {
    return {
      isValid: false,
      displayError: true,
      errorMessage: "Input exceeds 18 decimal places"
    }
  }

  if (isGreaterThan(value, maxValue)) {
    return {
      isValid: false,
      displayError: true,
      errorMessage: "Insufficent Balance"
    }
  }

  if (isLessThan(value, 1)) {
    return {
      isValid: false,
      displayError: true,
      errorMessage: `Minimum ${actionText} is one token`
    }
  }

  return {
    isValid: true,
    displayError: false,
    errorMessage: ""
  }
}