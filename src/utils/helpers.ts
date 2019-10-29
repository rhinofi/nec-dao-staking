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
    DAY: 86400,
    HOUR: 3600,
    MINUTE: 60,
    SECOND: 1
  }
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

export function getPeriodText(value) {
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
