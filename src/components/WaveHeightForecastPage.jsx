import React from "react";
import { getData } from "../services/noaa_surf_state";
import DirectionWaveHeightForecast from "./DirectionWaveHeightForecast";

export default class WaveHeightForecastPage extends React.Component {
  state = {
    currentDate: null,
    data: {},
    hasData: false,
  };
  fetching = false;

  _hasData() {
    return this.state.hasData;
  }

  componentDidMount() {
    getData().then((data) => {
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

  render() {
    if (!this._hasData()) return this._renderLoading();

    const { data } = this.state;
    const { waveHeights } = data;

    return (
      <div>
        {/* <DirectionWaveHeightForecast
          heights={waveHeights}
          direction='north'
        /> */}
        <DirectionWaveHeightForecast heights={waveHeights} direction="west" />
        {/* <DirectionWaveHeightForecast
          heights={waveHeights}
          direction='south'
        />
        <DirectionWaveHeightForecast
          heights={waveHeights}
          direction='east'
        /> */}
      </div>
    );
  }
}
