import React from 'react'
import PropTypes from 'prop-types'

export default class TideTable extends React.Component {

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

  render() {
    const { tides } = this.props;

    const rows = tides.map((tide, index) => 
      <tr key={tide.timestamp} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
        <td className="p-1 border border-gray-100 px-2 font-semibold">{tide.type}</td>
        <td className="p-1 border border-gray-100 px-2">{this._createTimeString(new Date(tide.timestamp))}</td>
        <td className="p-1 border border-gray-100 px-2">{tide.height}ft</td>
      </tr>
    );

    return (
      <table className="w-full border-collapse border border-gray-100 text-sm">
        <tbody>{rows}</tbody>
      </table>
    )
  }
}

TideTable.propTypes = {
  tides: PropTypes.array.isRequired,
}