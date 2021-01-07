import React from 'react'
import PropTypes from 'prop-types'

export default class WeatherTable extends React.Component {
  render() {
    const { generalDayInfo } = this.props;

    // {
    //   day: day,
    //   weather: weather,
    //   temperature: temperature,
    //   winds: winds,
    // }

    const days = [];
    days.push('');
    days.push(...generalDayInfo.map(dayInfo => dayInfo.day));

    const headers = days.map((day, index) =>
      <th className="p-1 px-2" key={index}>{day}</th>
    );
    
    const transposedRows = [];
    transposedRows.push({
      title: 'Weather',
      cells: generalDayInfo.map(dayInfo => dayInfo.weather),
    });
    transposedRows.push({
      title: 'Temperature',
      cells: generalDayInfo.map(dayInfo => dayInfo.temperature),
    });
    transposedRows.push({
      title: 'Winds',
      cells: generalDayInfo.map(dayInfo => dayInfo.winds),
    });


    const rows = transposedRows.map((row, index) => {
      const cells = row.cells.map((cell, cellIndex) =>
        <td className="border border-gray-100 p-1 px-2" key={cellIndex}>{cell}</td>
      );

      return (
        <tr className="bg-gray-50" key={index}>
          <td className="font-semibold border border-gray-100 p-1 px-2 text-xs">{row.title}</td>
          {cells}
        </tr>
      )
      }
    );

    return (
      <table className="text-left text-sm w-full">
        <tr className="bg-gray-600 text-white text-xs">
          {headers}
        </tr>
        {rows}
      </table>
    );
  }
}

WeatherTable.propTypes = {
  generalDayInfo: PropTypes.array.isRequired,
}