import React from "react";
import PropTypes from "prop-types";

export default class WeatherTable extends React.Component {
  _formatCell(cell) {
    return !cell || 0 === cell.length ? "-" : cell;
  }

  render() {
    const { generalDayInfo } = this.props;

    // {
    //   day: day,
    //   weather: weather,
    //   temperature: temperature,
    //   winds: winds,
    // }

    const days = [];
    days.push("");
    days.push(...generalDayInfo.map((dayInfo) => dayInfo.day));

    const headers = days.map((day, index) => (
      <th
        className={index === 0 ? "p-1 px-2 w-2/12" : "p-1 px-2 w-5/12"}
        key={index}
      >
        {day}
      </th>
    ));

    const transposedRows = [];
    transposedRows.push({
      title: "Weather",
      cells: generalDayInfo.map((dayInfo) => dayInfo.weather),
    });
    transposedRows.push({
      title: "Temperature",
      cells: generalDayInfo.map((dayInfo) => dayInfo.temperature),
    });
    transposedRows.push({
      title: "Winds",
      cells: generalDayInfo.map((dayInfo) => dayInfo.winds),
    });
    transposedRows.push({
      title: "Sunrise",
      cells: generalDayInfo.map((dayInfo) => dayInfo.sunrise),
    });
    transposedRows.push({
      title: "Sunset",
      cells: generalDayInfo.map((dayInfo) => dayInfo.sunset),
    });

    const rows = transposedRows.map((row, index) => {
      const cells = row.cells.map((cell, cellIndex) => (
        <td className="border border-gray-100 p-1 px-2" key={cellIndex}>
          {this._formatCell(cell)}
        </td>
      ));

      return (
        <tr className="bg-gray-50" key={index}>
          <td className="font-semibold border border-gray-100 p-1 text-xs truncate">
            {row.title}
          </td>
          {cells}
        </tr>
      );
    });

    return (
      <table className="text-left text-sm w-full table-fixed">
        <thead>
          <tr className="bg-gray-600 text-white text-xs">{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

WeatherTable.propTypes = {
  generalDayInfo: PropTypes.array.isRequired,
};
