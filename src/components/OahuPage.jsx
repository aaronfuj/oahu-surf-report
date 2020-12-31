import React from 'react'
import { WAIMEA_BAY, BARBERS_POINT, KANEOHE_BAY, PEARL_HARBOR } from '../constants/NoaaBuoys';
import { HONOLULU, WAIANAE, WAIMANALO, WAIMEA_BAY as WAIMEA_BAY_TIDES } from '../constants/NoaaTides'
import Location from './Location'
import { getData } from '../services/noaa_surf_state'

export default class OahuPage extends React.Component {

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

  _renderLoading() {
    return <div>Loading...</div>
  }

  render() {
    if (!this._hasData()) return this._renderLoading()

    const { data } = this.state;
    const { waveHeights } = data;

    return (
      <div className="space-y-10">
        <Location
          title={BARBERS_POINT.name}
          buoyId={BARBERS_POINT.id}
          buoyName={BARBERS_POINT.name}
          stationId={WAIANAE.id}
          stationName={WAIANAE.name}
          forecastHeights={waveHeights}
          direction='west'
        />

        <Location
          title={WAIMEA_BAY.name}
          buoyId={WAIMEA_BAY.id}
          buoyName={WAIMEA_BAY.name}
          stationId={WAIMEA_BAY_TIDES.id}
          stationName={WAIMEA_BAY_TIDES.name}
          forecastHeights={waveHeights}
          direction='north'
        />

        <Location
          title={PEARL_HARBOR.name}
          buoyId={PEARL_HARBOR.id}
          buoyName={PEARL_HARBOR.name}
          stationId={HONOLULU.id}
          stationName={HONOLULU.name}
          forecastHeights={waveHeights}
          direction='south'
        />

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
    );
  }
}