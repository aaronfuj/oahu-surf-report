import React from "react";
import {
  HANALEI,
  NAWILIWILI,
} from "../constants/NoaaBuoys";
import {
  HANALEI as HANALEI_TIDES,
  NAWILIWILI as NAWILIWILI_TIDES,
} from "../constants/NoaaTides";
import {
  HANALEI as HANALEI_COORDINATES,
  NAWILIWILI as NAWILIWILI_COORDINATES,
} from "../constants/GeographicCoordinates";
import Location from "./Location";
import Forecast from "./Forecast";
import Footer from "./Footer";
import { getData } from "../services/noaa_surf_state";

import { Link } from "react-router-dom";

export default class KauaiPage extends React.Component {
  westRef = React.createRef();
  northRef = React.createRef();
  southRef = React.createRef();
  eastRef = React.createRef();

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
    document.title = 'Oahu Surf Report (NOAA)';

    getData('kauai').then((data) => {
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
            <Link to="/">Oahu</Link>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.northRef)}>
              Hanalei
            </button>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.eastRef)}>
              Nawiliwili
            </button>
          </div>
        </div>

        <div className="space-y-16">
          <Forecast
            title="Kauai Surf Forecast"
            date={lastBuildDateObject}
            discussion={discussion}
            generalDayInfo={generalDayInfo}
          />

          <div ref={this.northRef}>
            <Location
              title={HANALEI.name}
              buoyId={HANALEI.id}
              buoyName={HANALEI.name}
              stationId={HANALEI_TIDES.id}
              stationName={HANALEI_TIDES.name}
              stationCoordinates={HANALEI_COORDINATES}
              forecastHeights={waveHeights}
              direction="north"
            />
          </div>

          <div ref={this.eastRef}>
            <Location
              title={NAWILIWILI.name}
              buoyId={NAWILIWILI.id}
              buoyName={NAWILIWILI.name}
              stationId={NAWILIWILI_TIDES.id}
              stationName={NAWILIWILI_TIDES.name}
              stationCoordinates={NAWILIWILI_COORDINATES}
              forecastHeights={waveHeights}
              direction="east"
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
