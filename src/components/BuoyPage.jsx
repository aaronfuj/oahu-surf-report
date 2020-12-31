import React from 'react'
import { getData } from '../services/noaa_buoys'
import LatestHeight from './LatestHeight'
import BuoyChart from './BuoyChart'
import { TrendPattern } from '../constants/TrendPattern'
import PropTypes from 'prop-types'
import { calculateSlope } from '../services/simple_linear_regression'

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
    return parsedValues.reduce((latestPoint, currentPoint) => {
      if (latestPoint.timestamp > currentPoint.timestamp) return latestPoint;
      return currentPoint;
    }, parsedValues[0]);
  }

  _createSeries(parsedValues) {
    const series = parsedValues
      .map(value => [value.timestamp, value.significantWaveHeightFt])
      .reverse();
    return series;
  }

  _latestDays(parsedValues, days) {
    // Buoy update intervals are expected to be every 30 minutes
    const estimatedEntries = days * 24 * 2;
    return parsedValues.slice(0, Math.max(estimatedEntries, 0));
  }

  _latestDay(parsedValues) {
    return this._latestDays(parsedValues, 1);
  }

  _latestFiveDays(parsedValues) {
    return this._latestDays(parsedValues, 5);
  }


  // Calculate the slope using simple linear regression, with the end result being an expected result of
  // Ft/day.
  _calculateSlope(parsedValues) {
    const ascendingValues = parsedValues.reverse();
    const firstTime = ascendingValues[0].timestamp;

    // converts the time interval into minutes, meaning the slope can be considered feet/min
    const timeValue = (value) => (value.timestamp - firstTime) / 1000 / 60;

    const xValues = ascendingValues.map(timeValue);
    const yValues = ascendingValues.map(value => value.significantWaveHeightFt);

    let slope = calculateSlope(xValues, yValues);

    // convert the resulting slope back to feet/day
    return slope * 60 * 24;
  }

  _getTrendPattern(slope) {
    // consider the data trending if there is a pattern of increasing or decreasing by a foot within the day
    if (slope > 1) {
      return TrendPattern.UP;
    }
    else if (slope < -1) {
      return TrendPattern.DOWN;
    }
    return TrendPattern.NONE;
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
    const lastDate = latestData.date;
    const lastWaveHeight = latestData.significantWaveHeightFt;

    const slope = this._calculateSlope(this._latestDay(data));
    console.log(`Slope for ${title} is ${slope}`);
    
    const trend = this._getTrendPattern(slope); 

    const seriesData = this._createSeries(this._latestFiveDays(data));

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