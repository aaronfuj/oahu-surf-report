export function pad2(number) {
  return (number < 10 ? "0" : "") + number;
}

export function createLocalTimeAmPmString(date) {
  let hour = date.getHours();
  let ampm = "am";

  if (hour === 12) {
    ampm = "pm";
  }
  if (hour === 0) {
    hour = 12;
  }
  if (hour > 12) {
    hour = hour - 12;
    ampm = "pm";
  }

  return hour + ":" + pad2(date.getMinutes()) + "" + ampm;
}