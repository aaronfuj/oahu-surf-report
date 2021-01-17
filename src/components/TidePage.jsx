import React from 'react'
import SwipeableViews from 'react-swipeable-views';

import { getData } from '../services/noaa_tides'
import getTimes from '../services/sunrise_sunset'
import MonotoneInterpolatorCreator from '../services/monotone_cubic_spline_interpolation'
import { TideTrend } from '../constants/TideTrend'
import CurrentTideTrend from './CurrentTideTrend'
import TideTable from './TideTable'
import TideChart from './TideChart'
import PropTypes from 'prop-types'


export default class TidePage extends React.Component {
  state = {
    currentDate: null,
    data: {},
    hasData: false,
  }
  fetching = false

  _hasData() {
    return this.state.hasData
  }

  _filterToDay(data, dayDate) {
    const lowerTimestamp = dayDate.getTime();
    const upperTimestamp = dayDate.getTime() + 24 * 60 * 60 * 1000;
    return data.filter(datum => datum.timestamp >= lowerTimestamp && datum.timestamp <= upperTimestamp);
  }

  componentDidMount() {
    const { stationId } = this.props

    const currentDate = new Date()

    getData(stationId, currentDate).then((data) => {
      console.log(data);
      this.setState({
        currentDate: currentDate,
        data: data,
        hasData: true,
      })
      this.fetching = false

      console.log('Done fetching data')
    })
  }


  _createSeries(data) {
    return data.map(datum => {
      return [ datum.timestamp, datum.height ];
    });
  }

  _addDays(date, days) {
    let newDate = new Date(date.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  _getNextTide(data, currentDate) {
    const timestamp = currentDate.getTime();
    const firstResult = data.find(datum => datum.timestamp > timestamp);
    return firstResult ? firstResult : data[data.length-1];
  }

  _determineTrend(data, currentDate) {
    const firstResult = this._getNextTide(data, currentDate);
    if (firstResult) {
      return firstResult.type.toLowerCase() === 'low' ? TideTrend.FALLING : TideTrend.RISING;
    }
    return TideTrend.NONE;
  }

  _roundTwoDigits(number) {
    return Math.round(number * 100) / 100;
  }

  _estimateHeight(data, currentDate) {
    const interpolator = MonotoneInterpolatorCreator(data.map(datum => datum.timestamp), data.map(datum => datum.height));
    const estimatedHeight = interpolator(currentDate.getTime());
    return this._roundTwoDigits(estimatedHeight);
  }

  _renderLoading() {
    return <div>Loading...</div>
  }

  _formatDate(date) {
    return date.toDateString() + " " +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  }

  _pad2(number) {
    return (number < 10 ? '0' : '') + number;
  }

  _createTimeString(date) {
    let hour = date.getHours();
    let ampm = 'am';
    
    if (hour === 12){
      ampm = 'pm'
    }
    if (hour === 0){
      hour = 12;
    }
    if (hour > 12){
      hour = hour - 12;
      ampm = 'pm'
    }
  
    return hour + ':' + this._pad2(date.getMinutes()) + '' + ampm;
  }

  _createDayString(date) {
    let options = { weekday: 'long', month: 'numeric', day: 'numeric' }; 
    return date.toLocaleString('en-US', options);
  }

  render() {
    if (!this._hasData()) return this._renderLoading()

    const { currentDate, data } = this.state;
    const { title, coordinates } = this.props;

    if (data.length === 0) {
      return (
        <div>
          <span>Missing tide data for {title}</span>
        </div>
      );
    }

    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const nextDayDate = this._addDays(dayDate, 1);
    const singleDayData = this._filterToDay(data, dayDate);
    const nextSingleDayData = this._filterToDay(data, this._addDays(dayDate, 1));

    const minDate = new Date(currentDate.toDateString());
    const maxDate = this._addDays(minDate, 1);
    const seriesData = this._createSeries(data);

    const estimatedHeight = this._estimateHeight(data, currentDate);
    const trend = this._determineTrend(data, currentDate);
    const nextTide = this._getNextTide(data, currentDate);

    const day1Times = getTimes(coordinates, currentDate);
    const day2Times = getTimes(coordinates, this._addDays(currentDate, 1));

    return (
      <div>
        <CurrentTideTrend
          estimatedHeight={estimatedHeight}
          trend={trend}
          tide={nextTide}
        />
        <div className="text-xs text-gray-400">{title} tides</div>

        <SwipeableViews className="block sm:hidden">
          <div className="overflow-hidden">
            <div>
              <span className="text-sm">{this._createDayString(dayDate)}</span>
            </div>
            <TideChart
              minDate={minDate}
              maxDate={maxDate}
              currentDate={currentDate}
              sunrise={day1Times.sunrise}
              sunset={day1Times.sunset}
              data={seriesData}
            />
            <TideTable
              tides={singleDayData}
            />
          </div>
          <div className="overflow-hidden">
            <div>
              <span className="text-sm">{this._createDayString(nextDayDate)}</span>
            </div>
            <TideChart
              minDate={this._addDays(minDate, 1)}
              maxDate={this._addDays(maxDate, 1)}
              currentDate={currentDate}
              sunrise={day2Times.sunrise}
              sunset={day2Times.sunset}
              data={seriesData}
            />
            <TideTable
              tides={nextSingleDayData}
            />
          </div>
        </SwipeableViews>

        <div className="hidden sm:flex space-x-1">
          <div className="flex-1 overflow-hidden">
            <div>
              <span className="text-sm">{this._createDayString(dayDate)}</span>
            </div>
            <TideChart
              minDate={minDate}
              maxDate={maxDate}
              currentDate={currentDate}
              sunrise={day1Times.sunrise}
              sunset={day1Times.sunset}
              data={seriesData}
            />
            <TideTable
              tides={singleDayData}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <div>
              <span className="text-sm">{this._createDayString(nextDayDate)}</span>
            </div>
            <TideChart
              minDate={this._addDays(minDate, 1)}
              maxDate={this._addDays(maxDate, 1)}
              currentDate={currentDate}
              sunrise={day2Times.sunrise}
              sunset={day2Times.sunset}
              data={seriesData}
            />
            <TideTable
              tides={nextSingleDayData}
            />
          </div>
        </div>
      </div>
    )
  }
}

TidePage.propTypes = {
  title: PropTypes.string.isRequired,
  stationId: PropTypes.string.isRequired,
  coordinates: PropTypes.object.isRequired,
}