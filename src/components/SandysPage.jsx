import React from "react";
import {
  KANEOHE_BAY,
  PEARL_HARBOR,
} from "../constants/NoaaBuoys";
import { HONOLULU, HANAUMA_BAY } from "../constants/NoaaTides";
import {
  HONOLULU as HONOLULU_COORDINATES,
  SANDY_BEACH as SANDY_BEACH_COORDINATES,
} from "../constants/GeographicCoordinates";
import Location from "./Location";
import Forecast from "./Forecast";
import Footer from "./Footer";
import { getData } from "../services/noaa_surf_state";
import { Link } from "react-router-dom";

export default class SandysPage extends React.Component {
  southRef = React.createRef();
  eastRef = React.createRef();
  forecastRef = React.createRef();

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

      console.log("Done fetching forecast data");
    });
  }

  _executeScroll(ref) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  _renderLoading() {
    return <div>Loading...</div>;
  }

  render() {
    if (!this._hasData()) return this._renderLoading();

    const { data } = this.state;
    const {
      lastBuildDateObject,
      waveHeights,
      discussion,
      generalDayInfo,
    } = data;

    return (
      <div>
        <div className="flex text-center mb-2 pb-2 font-semibold border-b-2 border-gray-600">
          <div className="flex-1">
            <Link to="/">Home</Link>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.southRef)}>
              South
            </button>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.eastRef)}>
              East
            </button>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.forecastRef)}>
              Forecast
            </button>
          </div>
        </div>

        <div className="space-y-16">
          <div ref={this.southRef}>
            <Location
              title={PEARL_HARBOR.name}
              buoyId={PEARL_HARBOR.id}
              buoyName={PEARL_HARBOR.name}
              stationId={HONOLULU.id}
              stationName={HONOLULU.name}
              stationCoordinates={HONOLULU_COORDINATES}
              forecastHeights={waveHeights}
              direction="south"
            />
          </div>

          <div ref={this.eastRef}>
            <Location
              title={KANEOHE_BAY.name}
              buoyId={KANEOHE_BAY.id}
              buoyName={KANEOHE_BAY.name}
              stationId={HANAUMA_BAY.id}
              stationName={HANAUMA_BAY.name}
              stationCoordinates={SANDY_BEACH_COORDINATES}
              forecastHeights={waveHeights}
              direction="east"
            />
          </div>

          <div ref={this.forecastRef}>
            <Forecast
              title="General Surf Forecast"
              date={lastBuildDateObject}
              discussion={discussion}
              generalDayInfo={generalDayInfo}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
