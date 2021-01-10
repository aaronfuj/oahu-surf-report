import SunCalc from 'suncalc'

export default function getTimes(geocordinates, date) {
  const {latitude, longitude} = geocordinates;
  return SunCalc.getTimes(date, latitude, longitude);
}