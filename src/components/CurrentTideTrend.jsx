import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TideTrend } from '../constants/TideTrend'

export default class CurrentTideTrend extends Component {

  _getTrendText(trend) {
    switch (trend) {
      case TideTrend.RISING: return 'Rising'
      case TideTrend.FALLING: return 'Falling'
      default: return ''
    }
  }
  
  _getTrendCharacter(trend) {
    switch (trend) {
      case TideTrend.RISING: return '▲'
      case TideTrend.FALLING: return '▼'
      default: return ''
    }
  }

  _pad2(number) {
    return (number < 10 ? '0' : '') + number;
  }
  
  _createTimeString(date) {
    let hour = date.getHours();
    let ampm = 'am';
    
    if (hour === 12){
      ampm = 'pm'
    }
    if (hour === 0){
      hour = 12;
    }
    if (hour > 12){
      hour = hour - 12;
      ampm = 'pm'
    }
  
    return hour + ':' + this._pad2(date.getMinutes()) + '' + ampm;
  }

  _getNextTideText(tide) {
    return `${tide.type} tide at ${this._createTimeString(new Date(tide.timestamp))}`;
  }

  render() {
    const { trend, tide } = this.props

    const trendText = this._getTrendText(trend);
    const trendChar = this._getTrendCharacter(trend);
    const nextTide = this._getNextTideText(tide);

    return (
      <div>
        <div className="text-medium">
          <span>{trendText}</span> Tide<span>{trendChar}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400">{nextTide}</span>
        </div>
      </div>
    )
  }
}

CurrentTideTrend.propTypes = {
  trend: PropTypes.string.isRequired,
  tide: PropTypes.object.isRequired,
}
