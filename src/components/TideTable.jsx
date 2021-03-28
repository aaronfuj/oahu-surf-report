import React from "react";
import PropTypes from "prop-types";
import {createLocalTimeAmPmString} from "./date-utils";

export default class TideTable extends React.Component {

  render() {
    const { tides } = this.props;

    const rows = tides.map((tide, index) => (
      <tr key={tide.timestamp} className={index % 2 === 0 ? "bg-gray-50" : ""}>
        <td className="p-1 border border-gray-100 px-2 font-semibold">
          {tide.type}
        </td>
        <td className="p-1 border border-gray-100 px-2">
          {createLocalTimeAmPmString(new Date(tide.timestamp))}
        </td>
        <td className="p-1 border border-gray-100 px-2">{tide.height}ft</td>
      </tr>
    ));

    return (
      <table className="w-full border-collapse border border-gray-100 text-sm">
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

TideTable.propTypes = {
  tides: PropTypes.array.isRequired,
};
