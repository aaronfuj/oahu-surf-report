import React, { Component } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import PropTypes from 'prop-types'

Highcharts.setOptions({
  global: {
      // timezoneOffset: +1,
      useUTC: false
  }
});

export default class TideChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartOptions: {
        title: {
          // text: location
          text: null
        },

        chart: {
          type: 'areaspline',
          margin: [0, 0, 0, 0],
          // spaceingLeft: 0,
          // spacingRight: 0,
          // zoomType: 'x',
          height: 100,
        },

        yAxis: {
          title: {
            // text: 'Height (ft)'
            text: null
          },
          min: -0.5,
          max: 2.5,
          tickInterval: 1,
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: 'left',
            x: 2,
            y: 3,
          },
        },

        tooltip: {
          shared: true,
          crosshairs: true,
          formatter: function () {
            var date = new Date(this.x);
            var datestring = Highcharts.dateFormat("%A, %b %e %Y, %l:%M %p ", date);

            var s = '<span style="font-size: 10px;">' + datestring + '</span>';
            if (this.points) {
              s += '<br/><span style="color: #0080FF">' + this.points[0].series.name + ':</span><b> ' + this.points[0].y.toFixed(2) + '</b>';
            } else {
              s += '<br/><span style="color: #00FF00">' + this.series.name + ':</span><b> ' + this.y.toFixed(2) + '</b>';
            }
            return s;
          }
        },

        xAxis: {
          type: 'datetime',
          plotBands: this._createPlotBands(props.minDate, props.sunrise, props.sunset, props.maxDate),
          plotLines: [this._createPlotLine(props.currentDate)],
          min: props.minDate.getTime(),
          max: props.maxDate.getTime(),
          // minorTickLength: 0,
          tickLength: 0,
          // tickInterval: 1000 * 60 * 60 * 24,
          // visible: false,
          labels: {
            enabled: false,
            // formatter: function() {
            //   var date = new Date(this.value);
            //   var datestring = (date.getMonth() + 1) + '/' + date.getDate();
            //   return datestring;
            // },
          },
        },

        // tooltip: {
        //     xDateFormat: '%A, %B %d, %Y'
        // },

        legend: {
          enabled: false
        },

        // plotOptions: {
        //     series: {
        //         pointPadding: 0.1,
        //         groupPadding: 0.1,
        //         borderWidth: 0,
        //     }
        // },

        series: [{
          name: 'Wave Heights',
          data: props.data,
          fillOpacity: 0.3,
          threshold: -0.5,
          marker: {
            enabled: false,
            // radius: 3,
          },
        }],

        responsive: {
          rules: [{
            condition: {
              maxWidth: 590
            },
            chartOptions: {
              yAxis: {
                title: {
                  text: null
                }
              },
            }
          }]
        },

        credits: {
          enabled: false
        },
      }
    }
  }

  _createPlotBand(startDate, endDate) {
    return {
      color: '#F3F4F6',
      from: startDate.getTime(),
      to: endDate.getTime(),
    };
  }

  _createPlotBands(minDate, sunrise, sunset, maxDate) {
    const bands = [];

    if (minDate && sunrise) {
      bands.push(this._createPlotBand(minDate, sunrise));
    }
    if (sunset && maxDate) {
      bands.push(this._createPlotBand(sunset, maxDate));
    }

    return bands;
  }

  

  _createPlotLine(date) {
    return {
      // color: '#96ff96',
      color: 'red',
      width: 2,
      value: date.getTime(),
      zIndex: 5,
    };
  }

  render() {
    const { chartOptions } = this.state;

    return (
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
        />
      </div>
    )
  }
}

TideChart.propTypes = {
  minDate: PropTypes.instanceOf(Date).isRequired,
  maxDate: PropTypes.instanceOf(Date).isRequired,
  currentDate: PropTypes.instanceOf(Date).isRequired,
  sunrise: PropTypes.instanceOf(Date),
  sunset: PropTypes.instanceOf(Date),
  data: PropTypes.array.isRequired,
}