import React from 'react'
import PropTypes from 'prop-types'

export default class SingleDayWaveHeightForecast extends React.Component {
  _getHeightColor(heightValue) {
    if (heightValue > 8) {
      return 'red';
    }
    else if (heightValue >= 6) {
      return 'yellow';
    }
    else if (heightValue >= 4) {
      return 'blue';
    }
    return 'gray';
  }

  render() {
    const { day, heights } = this.props;

    const forecastForTime = heights.map((singleForecast, index) => {
      const baseColor = this._getHeightColor(singleForecast.averageHeight);
      const bgColor = `bg-${baseColor}-300`;
      const bgColorLight = `bg-${baseColor}-50`;

      return (
        <div class="inline-block p-0 m-0 flex-1" key={index}>
          <div className={`w-full text-xs text-white p-1 px-2 md:px-3 ${bgColor}`}>
            <span>{singleForecast.time}</span>
          </div>
          <div className={`w-full text-base ${bgColorLight} p-1 px-2 md:px-3`}>
            <span className="font-semibold">{singleForecast.height}</span>
            <span className="font-extralight">FT</span>
          </div>
        </div>
      )
    });

    return (
      <div className="p-0 inline-block flex-1">
        <div className="block text-sm w-full">{day}</div>
        <div className="flex space-x-0.5">
          {forecastForTime}
        </div>
      </div>
    );
  }
}

SingleDayWaveHeightForecast.propTypes = {
  day: PropTypes.string.isRequired,
  heights: PropTypes.array.isRequired,
}