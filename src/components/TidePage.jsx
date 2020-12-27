import React from 'react'
import { getData } from '../services/noaa_tides'
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

  _toDate(dateString) {
    return new Date(dateString);
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

  _renderLoading() {
    return <div>Loading...</div>
  }

  render() {
    if (!this._hasData()) return this._renderLoading()

    const { currentDate, data } = this.state;
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const singleDayData = this._filterToDay(data, dayDate);

    const minDate = new Date(currentDate.toDateString());
    const maxDate = this._addDays(minDate, 1);
    const seriesData = this._createSeries(data);

    return (
      <div>
        <TideChart
          minDate={minDate}
          maxDate={maxDate}
          currentDate={currentDate}
          data={seriesData}
        />
        <TideTable
          tides={singleDayData}
        />
      </div>
    )
  }
}

TidePage.propTypes = {
  title: PropTypes.string.isRequired,
  stationId: PropTypes.string.isRequired,
}