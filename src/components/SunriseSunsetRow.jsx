import React from "react";
import PropTypes from "prop-types";
import {createLocalTimeAmPmString} from "./date-utils";

export default class SunriseSunsetRow extends React.Component {

  render() {
    const { sunrise, sunset } = this.props;

    return (
      <div className="flex px-2">
        <div className="inline-block flex-1">
          <div className="text-xs text-gray-400">Sunrise</div>
          <div className="text-xs">{createLocalTimeAmPmString(sunrise)}</div>
        </div>
        <div className="inline-block flex-1 text-right">
          <div className="text-xs text-gray-400">Sunset</div>
          <div className="text-xs">{createLocalTimeAmPmString(sunset)}</div>
        </div>
      </div>
    )
  }
}

SunriseSunsetRow.propTypes = {
  sunrise: PropTypes.instanceOf(Date).isRequired,
  sunset: PropTypes.instanceOf(Date).isRequired,
};