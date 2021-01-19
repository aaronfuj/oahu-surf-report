import React, { Component } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import PropTypes from "prop-types";

export default class BuoyChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartOptions: {
        title: {
          text: null,
        },

        chart: {
          type: "area",
          spaceingLeft: 0,
          spacingRight: 0,
          marginLeft: 20,
          // margin: [0, 0, 0, 0],
          zoomType: "x",
          height: 200,
        },

        yAxis: {
          title: {
            // text: 'Wave Height (ft)'
            text: null,
          },
          labels: {
            align: "right",
            x: -5,
            y: 3,
          },
        },

        xAxis: {
          type: "datetime",
          minPadding: 0,
          maxPadding: 0,
        },

        legend: {
          enabled: false,
        },

        series: [
          {
            name: "Tide Heights",
            data: props.data,
          },
        ],

        tooltip: {
          formatter: function () {
            var date = new Date(this.x);
            var datestring = Highcharts.dateFormat(
              "%A, %b %e %Y, %l:%M %p ",
              date
            );

            var s = '<span style="font-size: 10px;">' + datestring + "</span>";
            if (this.points) {
              s +=
                '<br/><span style="color: #0080FF">' +
                this.points[0].series.name +
                ":</span><b> " +
                this.points[0].y.toFixed(2) +
                "</b>";
            } else {
              s +=
                '<br/><span style="color: #0080FF">' +
                this.series.name +
                ":</span><b> " +
                this.y.toFixed(2) +
                "</b>";
            }
            return s;
          },
        },

        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 590,
              },
              chartOptions: {
                yAxis: {
                  title: {
                    text: null,
                  },
                },
              },
            },
          ],
        },

        credits: {
          enabled: false,
        },
      },
    };
  }

  render() {
    const { chartOptions } = this.state;

    return (
      <div>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    );
  }
}

BuoyChart.propTypes = {
  data: PropTypes.array.isRequired,
};
