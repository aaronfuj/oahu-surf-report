import React from "react";
import { Link } from "react-router-dom";

export default class Footer extends React.Component {
  render() {
    return (
      <div className="space-y-4 space-x-4">
        <div className="flex flex-col md:flex-row pt-10">
          <div className="flex-none pt-2 pr-2">
            <div className="font-bold text-sm text-gray-600">Spots</div>
            <ul className="text-xs text-gray-500">
              <li>
                <Link to="/sandys">Sandys</Link>
              </li>
            </ul>
          </div>
          <div className="flex-none pt-2 pr-2">
            <div className="font-bold text-sm text-gray-600">Resources</div>
            <ul className="text-xs text-gray-500">
              <li>
                <a href="https://www.weather.gov/hfo/SRF">
                  Surf Forecast for the State of Hawaii
                </a>
              </li>
              <li>
                <a href="https://tidesandcurrents.noaa.gov/tide_predictions.html?gid=1399">
                  NOAA Tide Predictions (Hawaii)
                </a>
              </li>
              <li>
                <a href="https://www.ndbc.noaa.gov/maps/Hawaii.shtml">
                  NOAA Buoy Center (Hawaii)
                </a>
              </li>
            </ul>
          </div>
          <div className="md:flex-auto pt-2">
            <div className="font-bold text-sm text-gray-600">Disclaimer</div>
            <div className="text-xs text-gray-500">
              <span>This website is for informational purposes only. </span>
              <span>
                This website is powered by APIs and news feeds courtesty of the
                National Oceanic and Atmospheric Administration (NOAA).{" "}
              </span>
              <span>
                This website is not representative of the views of NOAA nor does
                it have any direct affiliation with NOAA.{" "}
              </span>
              <span>
                All the information on this website is published in good faith
                and for general information purpose only. This website does not
                make any warranties about the completeness, reliability and
                accuracy of this information.
              </span>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400">
          An <a href="https://www.aaronfujimoto.com/">Aaron Fujimoto</a> Project
        </div>
      </div>
    );
  }
}
