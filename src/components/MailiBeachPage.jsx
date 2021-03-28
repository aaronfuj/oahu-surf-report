import React from "react";
import {
  WAIMEA_BAY,
  BARBERS_POINT,
} from "../constants/NoaaBuoys";
import { HALEIWA, WAIANAE } from "../constants/NoaaTides";
import {
  GREEN_LANTERNS as GREEN_LANTERNS_COORDINATES,
  WAIMEA_BAY as WAIMEA_BAY_COORDINATES,
} from "../constants/GeographicCoordinates";
import Location from "./Location";
import Forecast from "./Forecast";
import Footer from "./Footer";
import { getData } from "../services/noaa_surf_state";
import { Link } from "react-router-dom";

export default class MailiBeachPage extends React.Component {
  northRef = React.createRef();
  westRef = React.createRef();
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
    document.title = 'Maili Beach Surf Report (NOAA)';

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
            <button onClick={() => this._executeScroll(this.northRef)}>
              North
            </button>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.westRef)}>
              West
            </button>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.forecastRef)}>
              Forecast
            </button>
          </div>
        </div>

        <div className="space-y-16">
          <div ref={this.northRef}>
            <Location
              title={WAIMEA_BAY.name}
              buoyId={WAIMEA_BAY.id}
              buoyName={WAIMEA_BAY.name}
              stationId={HALEIWA.id}
              stationName={HALEIWA.name}
              stationCoordinates={WAIMEA_BAY_COORDINATES}
              forecastHeights={waveHeights}
              direction="north"
            />
          </div>

          <div ref={this.westRef}>
            <Location
              title={BARBERS_POINT.name}
              buoyId={BARBERS_POINT.id}
              buoyName={BARBERS_POINT.name}
              stationId={WAIANAE.id}
              stationName={WAIANAE.name}
              stationCoordinates={GREEN_LANTERNS_COORDINATES}
              forecastHeights={waveHeights}
              direction="west"
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
