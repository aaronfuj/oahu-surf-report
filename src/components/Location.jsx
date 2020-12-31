import React from 'react'
import BuoyPage from './BuoyPage'
import TidePage from './TidePage'
import PropTypes from 'prop-types'

import DirectionWaveHeightForecast from './DirectionWaveHeightForecast'

export default class Location extends React.Component {

  render() {
    const { title, buoyId, buoyName, stationId, stationName, direction, forecastHeights } = this.props;

    return (
      <div>
        <div className="text-4xl font-thin text-center md:text-left">{title}</div>
        <BuoyPage
          buoyId={buoyId}
          title={buoyName}
        />
        <TidePage
          stationId={stationId}
          title={stationName}
        />
        <div className="text-2xl font-thin pt-4 text-center md:text-left">Forecast</div>
        <DirectionWaveHeightForecast
          heights={forecastHeights}
          direction={direction}
        />
      </div>
    )
  };
}

Location.propTypes = {
  title: PropTypes.string.isRequired,
  buoyId: PropTypes.string.isRequired,
  buoyName: PropTypes.string.isRequired,
  stationId: PropTypes.string.isRequired,
  stationName: PropTypes.string.isRequired,
  direction: PropTypes.string.isRequired,
  forecastHeights: PropTypes.array.isRequired,
}