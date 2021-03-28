import React, { Component } from "react";
import PropTypes from "prop-types";
import { TideTrend } from "../constants/TideTrend";
import {createLocalTimeAmPmString} from "./date-utils";

export default class CurrentTideTrend extends Component {
  _getTrendText(trend) {
    switch (trend) {
      case TideTrend.RISING:
        return "Rising";
      case TideTrend.FALLING:
        return "Falling";
      default:
        return "";
    }
  }

  _getTrendCharacter(trend) {
    switch (trend) {
      case TideTrend.RISING:
        return "▲";
      case TideTrend.FALLING:
        return "▼";
      default:
        return "";
    }
  }

  _getNextTideText(tide) {
    // return `${tide.type} tide (${tide.height}ft) at ${this._createTimeString(new Date(tide.timestamp))}`;
    return `${tide.height}ft at ${createLocalTimeAmPmString(new Date(tide.timestamp))}`;
  }

  render() {
    const { estimatedHeight, trend, tide } = this.props;

    const trendText = this._getTrendText(trend);
    const trendChar = this._getTrendCharacter(trend);
    const nextTide = this._getNextTideText(tide);

    return (
      <div className="py-2">
        <div className="text-2xl">
          <span className="font-semibold">{estimatedHeight}FT</span>{" "}
          <span>{trendChar}</span>
        </div>
        <div className="text-xs font-medium text-gray-400">
          <span>{trendText}</span> to <span>{nextTide}</span>
        </div>
      </div>
    );
  }
}

CurrentTideTrend.propTypes = {
  estimatedHeight: PropTypes.number,
  trend: PropTypes.string.isRequired,
  tide: PropTypes.object.isRequired,
};
