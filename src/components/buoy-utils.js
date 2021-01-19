import { TrendPattern } from "../constants/TrendPattern";
import { calculateSlope } from "../services/simple_linear_regression";

export function filterLatestDays(parsedValues, days) {
  // Buoy update intervals are expected to be every 30 minutes
  const estimatedEntries = days * 24 * 2;
  return parsedValues.slice(0, Math.max(estimatedEntries, 0));
}

export function extractLatestBuoyInfo(title, data) {
  const latestData = getLatestDataPoint(data);
  const date = latestData.date;
  const height = latestData.significantWaveHeightFt;

  const slope = calculateWaveHeightSlope(latestDay(data));
  console.log(`Slope for ${title} is ${slope}`);

  const trend = getTrendPattern(slope);

  return {
    title,
    height,
    trend,
    date,
  };
}

function getLatestDataPoint(parsedValues) {
  return parsedValues.reduce((latestPoint, currentPoint) => {
    if (latestPoint.timestamp > currentPoint.timestamp) return latestPoint;
    return currentPoint;
  }, parsedValues[0]);
}

// Calculate the slope using simple linear regression, with the end result being an expected result of
// Ft/day.
function calculateWaveHeightSlope(parsedValues) {
  const ascendingValues = parsedValues.reverse();
  const firstTime = ascendingValues[0].timestamp;

  // converts the time interval into minutes, meaning the slope can be considered feet/min
  const timeValue = (value) => (value.timestamp - firstTime) / 1000 / 60;

  const xValues = ascendingValues.map(timeValue);
  const yValues = ascendingValues.map((value) => value.significantWaveHeightFt);

  let slope = calculateSlope(xValues, yValues);

  // convert the resulting slope back to feet/day
  return slope * 60 * 24;
}

function getTrendPattern(slope) {
  // consider the data trending if there is a pattern of increasing or decreasing by a foot within the day
  if (slope > 1) {
    return TrendPattern.UP;
  } else if (slope < -1) {
    return TrendPattern.DOWN;
  }
  return TrendPattern.NONE;
}

function latestDay(parsedValues) {
  return filterLatestDays(parsedValues, 1);
}
