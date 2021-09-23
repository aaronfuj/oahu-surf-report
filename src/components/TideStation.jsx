import React from "react";
import SwipeableViews from "react-swipeable-views";

import { getData } from "../services/noaa_tides";
import getTimes from "../services/sunrise_sunset";
import MonotoneInterpolatorCreator from "../services/monotone_cubic_spline_interpolation";
import { TideTrend } from "../constants/TideTrend";
import CurrentTideTrend from "./CurrentTideTrend";
import SunriseSunsetRow from "./SunriseSunsetRow";
import TideTable from "./TideTable";
import TideChart from "./TideChart";
import PropTypes from "prop-types";

export default class TideStation extends React.Component {
  state = {
    currentDate: null,
    data: {},
    hasData: false,
  };
  fetching = false;

  _hasData() {
    return this.state.hasData;
  }

  _filterToDay(data, dayDate) {
    const lowerTimestamp = dayDate.getTime();
    const upperTimestamp = dayDate.getTime() + 24 * 60 * 60 * 1000;
    return data.filter(
      (datum) =>
        datum.timestamp >= lowerTimestamp && datum.timestamp <= upperTimestamp
    );
  }

  componentDidMount() {
    const { stationId } = this.props;

    const currentDate = new Date();

    getData(stationId, currentDate, 8).then((data) => {
      console.log(data);
      this.setState({
        currentDate: currentDate,
        data: data,
        hasData: true,
      });
      this.fetching = false;

      console.log("Done fetching data");
    });
  }

  _createSeries(data) {
    return data.map((datum) => {
      return [datum.timestamp, datum.height];
    });
  }

  _addDays(date, days) {
    let newDate = new Date(date.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  _getNextTide(data, currentDate) {
    const timestamp = currentDate.getTime();
    const firstResult = data.find((datum) => datum.timestamp > timestamp);
    return firstResult ? firstResult : data[data.length - 1];
  }

  _determineTrend(data, currentDate) {
    const firstResult = this._getNextTide(data, currentDate);
    if (firstResult) {
      return firstResult.type.toLowerCase() === "low"
        ? TideTrend.FALLING
        : TideTrend.RISING;
    }
    return TideTrend.NONE;
  }

  _roundTwoDigits(number) {
    return Math.round(number * 100) / 100;
  }

  _estimateHeight(data, currentDate) {
    const interpolator = MonotoneInterpolatorCreator(
      data.map((datum) => datum.timestamp),
      data.map((datum) => datum.height)
    );
    const estimatedHeight = interpolator(currentDate.getTime());
    return this._roundTwoDigits(estimatedHeight);
  }

  _renderLoading() {
    return <div>Loading...</div>;
  }

  _formatDate(date) {
    return (
      date.toDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    );
  }

  _createDayString(date) {
    let options = { weekday: "long", month: "numeric", day: "numeric" };
    return date.toLocaleString("en-US", options);
  }

  render() {
    if (!this._hasData()) return this._renderLoading();

    const { currentDate, data } = this.state;
    const { title, coordinates } = this.props;

    if (data.length === 0) {
      return (
        <div>
          <span>Missing tide data for {title}</span>
        </div>
      );
    }

    let maxDays = 7;
    maxDays = Math.min(maxDays, data.length);

    const dayDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const startMinDate = new Date(currentDate.toDateString());
    const startMaxDate = this._addDays(startMinDate, 1);
    const seriesData = this._createSeries(data);

    const estimatedHeight = this._estimateHeight(data, currentDate);
    const trend = this._determineTrend(data, currentDate);
    const nextTide = this._getNextTide(data, currentDate);

    const chartDetails = []
    for (let index = 0; index < maxDays; index++) {
      const iterDate = this._addDays(currentDate, index);
      const currentDayDate = this._addDays(dayDate, index);
      const dateString = this._createDayString(currentDayDate);
      const minDate = this._addDays(startMinDate, index);
      const maxDate = this._addDays(startMaxDate, index);
      const { sunrise, sunset } = getTimes(coordinates, iterDate);
      const singleDayData = this._filterToDay(data, currentDayDate);

      chartDetails.push({
        date: currentDayDate,
        dateString: dateString,
        minDate: minDate,
        maxDate: maxDate,
        sunrise: sunrise,
        sunset: sunset,
        singleDayData: singleDayData,
      });
    }

    const swipeables = chartDetails.map((details, index) => (
      <div className="overflow-hidden" key={index}>
        <div>
          <span className="text-xs font-medium">
            {details.dateString}
          </span>
        </div>
        <TideChart
          minDate={details.minDate}
          maxDate={details.maxDate}
          currentDate={currentDate}
          sunrise={details.sunrise}
          sunset={details.sunset}
          data={seriesData}
        />
        <TideTable tides={details.singleDayData} />
        <SunriseSunsetRow
          sunrise={details.sunrise}
          sunset={details.sunset}
        />
      </div>
    ));

    return (
      <div>
        <CurrentTideTrend
          estimatedHeight={estimatedHeight}
          trend={trend}
          tide={nextTide}
        />
        <div className="text-xs text-gray-400">{title} tides</div>

        <SwipeableViews className="sm:hidden" enableMouseEvents={true}>
          {swipeables}
        </SwipeableViews>

        <div className="hidden sm:flex space-x-1">
          <div className="flex-1 overflow-hidden">
            <div>
              <span className="text-xs font-medium">
                {chartDetails[0].dateString}
              </span>
            </div>
            <TideChart
              minDate={chartDetails[0].minDate}
              maxDate={chartDetails[0].maxDate}
              currentDate={currentDate}
              sunrise={chartDetails[0].sunrise}
              sunset={chartDetails[0].sunset}
              data={seriesData}
            />
            <TideTable tides={chartDetails[0].singleDayData} />
            <SunriseSunsetRow
              sunrise={chartDetails[0].sunrise}
              sunset={chartDetails[0].sunset}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <div>
              <span className="text-xs font-medium">
                {chartDetails[1].dateString}
              </span>
            </div>
            <TideChart
              minDate={chartDetails[1].minDate}
              maxDate={chartDetails[1].maxDate}
              currentDate={currentDate}
              sunrise={chartDetails[1].sunrise}
              sunset={chartDetails[1].sunset}
              data={seriesData}
            />
            <TideTable tides={chartDetails[1].singleDayData} />
            <SunriseSunsetRow
              sunrise={chartDetails[1].sunrise}
              sunset={chartDetails[1].sunset}
            />
          </div>
        </div>
      </div>
    );
  }
}

TideStation.propTypes = {
  title: PropTypes.string.isRequired,
  stationId: PropTypes.string.isRequired,
  coordinates: PropTypes.object.isRequired,
};
