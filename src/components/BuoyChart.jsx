import React, { Component } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import PropTypes from 'prop-types'

export default class BuoyChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartOptions: {
        title: {
          text: null
        },

        chart: {
          type: 'area',
          zoomType: 'x',
          height: 200
        },

        yAxis: {
          title: {
            text: 'Wave Height (ft)'
          }
        },

        xAxis: {
          type: 'datetime'
        },

        legend: {
          enabled: false
        },

        series: [{
          name: 'Wave Heights',
          data: props.data
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

BuoyChart.propTypes = {
  data: PropTypes.array.isRequired,
}