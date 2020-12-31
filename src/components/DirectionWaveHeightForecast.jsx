import React from 'react'
import PropTypes from 'prop-types'
import SingleDayWaveHeightForecast from './SingleDayWaveHeightForecast'

export default class DirectionWaveHeightForecast extends React.Component {

  _filterDataToDirection(forecastJson, direction) {
    return forecastJson.filter(datum => datum.direction && datum.direction.toLowerCase().includes(direction.toLowerCase()));
  }

  _groupDataByDay(forecastJson) {
    return forecastJson.reduce((result, currentValue) => {
      if (result.length === 0) {
        const currentDay = [];
        currentDay.push(currentValue);
        result.push(currentDay);
      }
      else {
        const latestDay = result[result.length-1];
        if (latestDay[0].day === currentValue.day) {
          latestDay.push(currentValue);
        }
        else {
          const newDay = [];
          newDay.push(currentValue);
          result.push(newDay);
        }
      }
      return result;
    }, []);
  }


  render() {
    const { direction, heights } = this.props;

    const filteredData = this._filterDataToDirection(heights, direction);
    const groupedData = this._groupDataByDay(filteredData);

    return (
      <div class="space-x-1 flex w-full md:w-1/2 text-center md:text-left">
        {
          groupedData.map((data) => (
            <SingleDayWaveHeightForecast
              day={data[0].day}
              heights={data}
            />
          ))
        }
      </div>
    );
  }
}

DirectionWaveHeightForecast.propTypes = {
  direction: PropTypes.string.isRequired,
  heights: PropTypes.array.isRequired,
}