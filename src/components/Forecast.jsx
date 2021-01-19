import React from "react";
import PropTypes from "prop-types";
import ForecastDiscussion from "./ForecastDiscussion";
import WeatherTable from "./WeatherTable";

export default class Forecast extends React.Component {
  render() {
    const { title, date, discussion, generalDayInfo } = this.props;

    return (
      <div>
        <ForecastDiscussion title={title} date={date} discussion={discussion} />
        <WeatherTable generalDayInfo={generalDayInfo} />
      </div>
    );
  }
}

Forecast.propTypes = {
  title: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  discussion: PropTypes.array.isRequired,
  generalDayInfo: PropTypes.array.isRequired,
};
