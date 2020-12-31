import React from 'react'
import { getData } from '../services/noaa_buoys'
import LatestHeight from './LatestHeight'
import BuoyChart from './BuoyChart'
import {TrendPattern} from '../constants/TrendPattern'
import PropTypes from 'prop-types'


export default class BuoyPage extends React.Component {
  state = {
    data: {},
    hasData: false,
  }
  fetching = false

  _hasData() {
    return this.state.hasData
  }

  componentDidMount() {
    const { buoyId } = this.props

    getData(buoyId).then((data) => {
      console.log(data);
      this.setState({
        data: data,
        hasData: true,
      })
      this.fetching = false

      console.log('Done fetching data')
    })
  }

  _renderLoading() {
    return <div>Loading...</div>
  }

  _getLatestDataPoint(parsedValues) {
    return parsedValues[0];
  }

  _convertMetersToFeet(value) {
    // A higher performance method of truncating to 2 digits
    return Math.round((value * 3.28084) * 100) / 100;
  }

  _toDate(year, month, day, hour, minute) {
    const dateString = "" + year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00Z";
    return new Date(dateString);
  }

  _extractDate(value) {
    return this._toDate(value["YY"].value, value["MM"].value, value["DD"].value, value["hh"].value, value["mm"].value);
  }
  
  _extractWaveHeight(value) {
      return this._convertMetersToFeet(parseFloat(value["WVHT"].value));
  }

  _createSeries(parsedValues) {
    const series = parsedValues.map(value => {
        const timestamp = this._extractDate(value);
        const yValue = this._extractWaveHeight(value);
        return [timestamp.getTime(), yValue];
    }).reverse();

    return series;
  }

  _latestDay(parsedValues) {
    return parsedValues.slice(0, Math.max((24 * 2), 0));
  }

  _latestFiveDays(parsedValues) {
    return parsedValues.slice(0, Math.max((5 * 24 * 2), 0));
  }

  // Calculate the slope using simple linear regression, with the end result being an expected result of
  // Ft/day.
  _calculateSlope(parsedValues) {
    const ascendingValues = parsedValues.reverse();
    const firstTime = this._extractDate(ascendingValues[0]).getTime();

    const sum = (accumulator, currentValue) => accumulator + currentValue;
    const sumSquares = (accumulator, currentValue) => accumulator + (currentValue*currentValue);

    // converts the time interval into minutes, meaning the slope can be considered feet/min
    const timeValue = (value) => (this._extractDate(value).getTime() - firstTime) / 1000 / 60;

    const xValues = ascendingValues.map(timeValue);
    const yValues = ascendingValues.map(value => this._extractWaveHeight(value));
    const xTimesYValues = ascendingValues.map(value => timeValue(value) * this._extractWaveHeight(value));

    let xSummed = xValues.reduce(sum);
    let xSquaredSummed = xValues.reduce(sumSquares);
    let ySummed = yValues.reduce(sum);
    let xTimesYValuesSummed = xTimesYValues.reduce(sum);

    let n = ascendingValues.length;
    let numerator = (n * xTimesYValuesSummed) - (xSummed * ySummed);
    let denominator = (n * xSquaredSummed) - (xSummed * xSummed);

    // Convert the end usable slope into ft/day
    return (numerator / denominator) * 60 * 24;
  }


  render() {
    if (!this._hasData()) return this._renderLoading()

    const { data } = this.state;
    const { title } = this.props;

    if (data.length === 0) {
      return (
        <div>
          <span>Missing buoy data for {title}</span>
        </div>
      );
    }

    const latestData = this._getLatestDataPoint(data);
    const lastDate = this._extractDate(latestData);
    const lastWaveHeight = this._extractWaveHeight(latestData);

    const seriesData = this._createSeries(this._latestFiveDays(data));

    const slope = this._calculateSlope(this._latestDay(data));
    console.log('Slope for ' + title + 'is ' + slope);

    const increasingSlope = slope > 1;
    const decreasingSlope = slope < -1;
    const trend = increasingSlope ? TrendPattern.UP :
      (decreasingSlope ? TrendPattern.DOWN :
        TrendPattern.NONE);

    return (
      <div>
        <LatestHeight
          location={title}
          height={lastWaveHeight}
          trend={trend}
          timestamp={lastDate}
        />
        <BuoyChart
          data={seriesData}
        />
      </div>
    )
  }
}

BuoyPage.propTypes = {
  title: PropTypes.string.isRequired,
  buoyId: PropTypes.string.isRequired,
}