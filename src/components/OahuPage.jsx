import React from 'react'
import { WAIMEA_BAY, BARBERS_POINT, KANEOHE_BAY, PEARL_HARBOR } from '../constants/NoaaBuoys';
import { HONOLULU, WAIANAE, WAIMANALO, HALEIWA } from '../constants/NoaaTides'
import Location from './Location'
import Footer from './Footer'
import { getData } from '../services/noaa_surf_state'

export default class OahuPage extends React.Component {
  westRef = React.createRef();
  northRef = React.createRef();
  southRef = React.createRef();
  eastRef = React.createRef();

  state = {
    currentDate: null,
    data: {},
    hasData: false,
  }
  fetching = false

  _hasData() {
    return this.state.hasData
  }

  componentDidMount() {
    getData().then((data) => {
      console.log(data);
      this.setState({
        data: data,
        hasData: true,
      })
      this.fetching = false

      console.log('Done fetching forecast data')
    })
  }

  _executeScroll(ref) {
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  _renderLoading() {
    return <div>Loading...</div>
  }

  render() {
    if (!this._hasData()) return this._renderLoading()

    const { data } = this.state;
    const { waveHeights } = data;

    return (
      <div>
        <div className="flex text-center mb-2 pb-2 font-semibold border-b-2 border-gray-600">
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.northRef)}>North</button>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.westRef)}>West</button>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.southRef)}>South</button>
          </div>
          <div className="flex-1">
            <button onClick={() => this._executeScroll(this.eastRef)}>East</button>
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
              forecastHeights={waveHeights}
              direction='north'
            />
          </div>

          <div ref={this.westRef}>
            <Location
              title={BARBERS_POINT.name}
              buoyId={BARBERS_POINT.id}
              buoyName={BARBERS_POINT.name}
              stationId={WAIANAE.id}
              stationName={WAIANAE.name}
              forecastHeights={waveHeights}
              direction='west'
            />
          </div>


          <div ref={this.southRef}>
            <Location
              title={PEARL_HARBOR.name}
              buoyId={PEARL_HARBOR.id}
              buoyName={PEARL_HARBOR.name}
              stationId={HONOLULU.id}
              stationName={HONOLULU.name}
              forecastHeights={waveHeights}
              direction='south'
            />
          </div>

          <div ref={this.eastRef}>
            <Location
              title={KANEOHE_BAY.name}
              buoyId={KANEOHE_BAY.id}
              buoyName={KANEOHE_BAY.name}
              stationId={WAIMANALO.id}
              stationName={WAIMANALO.name}
              forecastHeights={waveHeights}
              direction='east'
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}