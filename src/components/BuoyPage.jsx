import React from "react";
import { getData } from "../services/noaa_buoys";
import CurrentBuoyInfo from "./CurrentBuoyInfo";
import BuoyChart from "./BuoyChart";
import PropTypes from "prop-types";
import { extractLatestBuoyInfo, filterLatestDays } from "./buoy-utils";

export default class BuoyPage extends React.Component {
  state = {
    data: {},
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
        data: data,
        hasData: true,
      });
      this.fetching = false;

      console.log("Done fetching data");
    });
  }

  _renderLoading() {
    return <div>Loading...</div>;
  }

  _createSeries(parsedValues) {
    const series = parsedValues
      .map((value) => [value.timestamp, value.significantWaveHeightFt])
      .reverse();
    return series;
  }

  _latestFiveDays(parsedValues) {
    return filterLatestDays(parsedValues, 5);
  }

  render() {
    if (!this._hasData()) return this._renderLoading();

    const { data } = this.state;
    const { title } = this.props;

    if (data.length === 0) {
      return (
        <div>
          <span>Missing buoy data for {title}</span>
        </div>
      );
    }

    const buoyInfo = extractLatestBuoyInfo(title, data);

    const seriesData = this._createSeries(this._latestFiveDays(data));

    return (
      <div>
        <CurrentBuoyInfo
          location={title}
          height={buoyInfo.height}
          trend={buoyInfo.trend}
          date={buoyInfo.date}
        />
        <BuoyChart data={seriesData} />
      </div>
    );
  }
}

BuoyPage.propTypes = {
  title: PropTypes.string.isRequired,
  buoyId: PropTypes.string.isRequired,
};
