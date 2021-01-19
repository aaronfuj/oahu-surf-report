import React from "react";
import PropTypes from "prop-types";

export default class ForecastDiscussion extends React.Component {
  _formatDate(date) {
    return (
      date.toDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    );
  }

  render() {
    const { title, date, discussion } = this.props;

    const paragraphs = discussion.map((paragraph, index) => (
      <p key={index} className="pb-2">
        {paragraph}
      </p>
    ));

    return (
      <div>
        <div className="text-4xl font-extrabold">
          <a href="https://www.weather.gov/hfo/SRF">{title}</a>
        </div>
        <div className="text-xs font-medium text-gray-400">
          {this._formatDate(date)}
        </div>
        <div className="pb-4">{paragraphs}</div>
      </div>
    );
  }
}

ForecastDiscussion.propTypes = {
  title: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  discussion: PropTypes.array.isRequired,
};
