import React from "react";
import PropTypes from "prop-types";

export default class SunriseSunsetRow extends React.Component {

  _pad2(number) {
    return (number < 10 ? "0" : "") + number;
  }

  _createTimeString(date) {
    let hour = date.getHours();
    let ampm = "am";

    if (hour === 12) {
      ampm = "pm";
    }
    if (hour === 0) {
      hour = 12;
    }
    if (hour > 12) {
      hour = hour - 12;
      ampm = "pm";
    }

    return hour + ":" + this._pad2(date.getMinutes()) + "" + ampm;
  }

  render() {
    const { sunrise, sunset } = this.props;

    return (
      <div className="flex px-2">
        <div className="inline-block flex-1">
          <div className="text-xs text-gray-400">Sunrise</div>
          <div className="text-xs">{this._createTimeString(sunrise)}</div>
        </div>
        <div className="inline-block flex-1 text-right">
          <div className="text-xs text-gray-400">Sunset</div>
          <div className="text-xs">{this._createTimeString(sunset)}</div>
        </div>
      </div>
    )
  }
}

SunriseSunsetRow.propTypes = {
  sunrise: PropTypes.instanceOf(Date).isRequired,
  sunset: PropTypes.instanceOf(Date).isRequired,
};