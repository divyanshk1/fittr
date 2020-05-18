let formatTwoDigits = (digit) => ("0" + digit).slice(-2);

export function getTodayDate() {
  var tempDate = new Date();
  return `${tempDate.getFullYear()}-${formatTwoDigits(tempDate.getMonth() + 1)}-${formatTwoDigits(tempDate.getDate())}`;
}