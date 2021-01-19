/**
 * Calculates the slope of the provided x and y values using simple linear regression.
 *
 * https://en.wikipedia.org/wiki/Simple_linear_regression
 * https://www.statisticshowto.com/probability-and-statistics/regression-analysis/find-a-linear-regression-equation
 *
 * For a linear line of y = mx + b, m can be calculated via:
 *
 *      n*sum(x*y) - sum(x)sum(xy)
 * m = ----------------------------
 *      n*sum(x^2) - (sum(x))^2
 *
 * The provided arrays of x and y values are expected to have the same size
 *
 * @param {array} xValues the x values
 * @param {array} yValues the y values
 */
export function calculateSlope(xValues, yValues) {
  if (xValues.length !== yValues.length) {
    throw Error("Length of the x and y values arrays are not the same!");
  }

  const length = xValues.length;

  const sum = (accumulator, currentValue) => accumulator + currentValue;
  const sumSquares = (accumulator, currentValue) =>
    accumulator + currentValue * currentValue;

  const xTimesYValues = [];
  for (let index = 0; index < length; index++) {
    const xValue = xValues[index];
    const yValue = yValues[index];
    xTimesYValues.push(xValue * yValue);
  }

  let xSummed = xValues.reduce(sum);
  let xSquaredSummed = xValues.reduce(sumSquares);
  let ySummed = yValues.reduce(sum);
  let xTimesYValuesSummed = xTimesYValues.reduce(sum);

  let n = length;
  let numerator = n * xTimesYValuesSummed - xSummed * ySummed;
  let denominator = n * xSquaredSummed - xSummed * xSummed;
  return numerator / denominator;
}
