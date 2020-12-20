import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {TrendPattern} from '../constants/TrendPattern'

export default class LatestHeight extends Component {

  _formatDate(date) {
    return date.toDateString() + " " +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  }

  _getTrendCharacter(trend) {
    switch (trend) {
      case TrendPattern.UP: return '▲'
      case TrendPattern.DOWN: return '▼'
      default: return ''
    }
  }

  render() {
    const { location, height, trend, timestamp } = this.props
    const formattedDate = this._formatDate(timestamp)

    const trendChar = this._getTrendCharacter(trend);
    

    return (
      <div>
        <div className="flex-none w-full pl-18 sm:pl-20 sm:py-0.5">
          <dt className="text-sm font-medium">{location}</dt>
          <dd className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            <span>{height}</span>FT <span>{trendChar}</span>
          </dd>
          <dt className="text-xs font-medium text-gray-400">{formattedDate}</dt>
        </div>
      </div>
    )
  }
}

LatestHeight.propTypes = {
  location: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  trend: PropTypes.string.isRequired,
  timestamp: PropTypes.any.isRequired,
}
