import React from "react";
import PropTypes from "prop-types";

import { getData } from "../services/noaa_buoys";
import { extractLatestBuoyInfo, filterLatestDays } from "./buoy-utils";

import CurrentBuoyInfo from "./CurrentBuoyInfo";
import BuoyChart from "./BuoyChart";
import TideStation from "./TideStation";
import DirectionWaveHeightForecast from "./DirectionWaveHeightForecast";

export default class Location extends React.Component {
  state = {
    buoyData: {},
    hasData: false,
  };
  fetching = false;

  _hasData() {
    return this.state.hasData;
  }

  componentDidMount() {
    const { buoyId } = this.props;

    getData(buoyId).then((data) => {
      console.log(data);
      this.setState({
        buoyData: data,
        hasData: true,
      });
      this.fetching = false;

      console.log("Done fetching data");
    });
  }

  _renderLoading() {
    return <div>Loading...</div>;
  }

  _capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  render() {
    if (!this._hasData()) return this._renderLoading();

    const { buoyData } = this.state;
    const {
      title,
      stationId,
      stationName,
      stationCoordinates,
      direction,
      forecastHeights,
    } = this.props;

    return (
      <div>
        <div className="text-4xl font-thin text-center md:text-left">
          {title}
        </div>
        <BuoyComponent
          title={title}
          buoyData={buoyData}
        />
        <TideStation
          stationId={stationId}
          title={stationName}
          coordinates={stationCoordinates}
        />
        <div className="text-2xl font-thin pt-4 text-center md:text-left">
          {this._capitalizeFirstLetter(direction)} Facing Forecast
        </div>
        <DirectionWaveHeightForecast
          heights={forecastHeights}
          direction={direction}
        />
      </div>
    );
  }
}

Location.propTypes = {
  title: PropTypes.string.isRequired,
  buoyId: PropTypes.string.isRequired,
  buoyName: PropTypes.string.isRequired,
  stationId: PropTypes.string.isRequired,
  stationName: PropTypes.string.isRequired,
  stationCoordinates: PropTypes.object.isRequired,
  direction: PropTypes.string.isRequired,
  forecastHeights: PropTypes.array.isRequired,
};

class BuoyComponent extends React.Component {
  _createBuoySeries(parsedValues) {
    const series = parsedValues
      .map((value) => [value.timestamp, value.significantWaveHeightFt])
      .reverse();
    return series;
  }

  _latestFiveDays(parsedValues) {
    return filterLatestDays(parsedValues, 5);
  }

  render() {
    const { title, buoyData } = this.props;

    if (buoyData.length === 0) {
      return (
        <div>No buoy data available</div>
      )
    }

    const buoyInfo = extractLatestBuoyInfo(title, buoyData);
    const buoySeriesData = this._createBuoySeries(
      this._latestFiveDays(buoyData)
    );

    if (isNaN(buoyInfo.height)) {
      return (
        <div>No buoy heights available</div>
      )
    }

    return (
      <div>
        <CurrentBuoyInfo
          location={title}
          height={buoyInfo.height}
          trend={buoyInfo.trend}
          date={buoyInfo.date}
        />
        <BuoyChart data={buoySeriesData} />
      </div>
    )
  }
}

BuoyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  buoyData: PropTypes.array.isRequired,
}

