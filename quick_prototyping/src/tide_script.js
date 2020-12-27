const HONOLULU =   { id: '1612340', name: 'Honolulu' };
const NAWILIWILI = { id: '1611400', name: 'Nawiliwili' };
const WAIMANALO =  { id: '1612376', name: 'Waimanalo' };
const WAIANAE =    { id: '1612482', name: 'Waianae' };
const WAIMEA_BAY = { id: '1611401', name: 'Waimea Bay' };

const TideTrend = {
  RISING: "rising",
  FALLING: "falling",
  NONE: "none",
}

const exampleData = {
  "predictions": [
    {
      "t": "2020-12-11 01:54",
      "v": "2.044",
      "type": "H"
    },
    {
      "t": "2020-12-11 08:19",
      "v": "0.454",
      "type": "L"
    },
    {
      "t": "2020-12-11 13:13",
      "v": "1.145",
      "type": "H"
    },
    {
      "t": "2020-12-11 19:19",
      "v": "-0.286",
      "type": "L"
    },
    {
      "t": "2020-12-12 02:37",
      "v": "2.309",
      "type": "H"
    },
    {
      "t": "2020-12-12 09:21",
      "v": "0.331",
      "type": "L"
    },
    {
      "t": "2020-12-12 14:04",
      "v": "0.984",
      "type": "H"
    },
    {
      "t": "2020-12-12 19:55",
      "v": "-0.329",
      "type": "L"
    }
  ]
};

function toDate(dateString) {
  return new Date(dateString);
}

function toDateRequestString(date) {
  return "" + date.getFullYear() + "" + pad2(date.getMonth()+1) + "" + pad2(date.getDate());
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getData(station) {
  const currentDate = new Date();
  const startDate = toDateRequestString(currentDate);

  console.log(currentDate);

  const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?" +
    "product=predictions" +
    "&application=FreeForecast" +
    "&begin_date=" + startDate +
    "&range=96" +
    "&datum=MLLW" +
    "&station=" + station.id +
    "&time_zone=gmt" +
    "&units=english" +
    "&interval=hilo" +
    "&format=json";

  fetch(url).then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log(data);
    return data;
  })
  .then((data) => {
    renderTrend(data, currentDate);
    renderTable(data, dayDate);
    return createSeries(data);
  })
  .then((data) => {
    console.log(data);
    plotData(data, currentDate, new Date(currentDate.toDateString()), new Date(currentDate.addDays(1).toDateString()));
  })
}

getData(HONOLULU);

function pad2(number) {
  return (number < 10 ? '0' : '') + number;
}

function createSeries(apiData) {
  return apiData.predictions.map(datum => {
    return [ toDate(datum.t + "Z").getTime(), parseFloat(datum.v) ];
  });
}

function createPlotLine(date) {
  return {
    // color: '#96ff96',
    color: 'red',
    width: 2,
    value: date.getTime(),
    zIndex: 5,
  };
}

Highcharts.setOptions({
    time: {
        useUTC: false
    }
});

function toTypeString(type) {
  switch (type) {
    case 'L': return 'Low';
    case 'H': return 'High';
    default: return type;
  }
}

function createDataModel(apiData) {
  return apiData.predictions.map(datum => {
    return {
      timestamp: toDate(datum.t + "Z").getTime(),
      type: toTypeString(datum.type),
      height: roundTwoDigits(parseFloat(datum.v))
    };
  });
}

function renderTrend(apiData, currentDate) {
  const data = createDataModel(apiData);
  const nextTide = getNextTide(data, currentDate);
  const trend = determineTrend(data, currentDate);
  document.getElementById('trend-text').innerHTML = getTrendText(trend);
  document.getElementById('trend-icon').innerHTML = getTrendCharacter(trend);
  document.getElementById('next-tide').innerHTML = getNextTideText(nextTide);
}

function getTrendText(trend) {
  switch (trend) {
    case TideTrend.RISING: return 'Rising'
    case TideTrend.FALLING: return 'Falling'
    default: return ''
  }
}

function getTrendCharacter(trend) {
  switch (trend) {
    case TideTrend.RISING: return '▲'
    case TideTrend.FALLING: return '▼'
    default: return ''
  }
}

function getNextTideText(tide) {
  return `${tide.type} tide at ${createTimeString(new Date(tide.timestamp))}`;
}

function renderTable(apiData, dayDate) {
  const tableData = createDataModel(apiData);

  const filteredTableDate = filterToDay(tableData, dayDate);
  let tableHtml = '';
  for (let index = 0; index < filteredTableDate.length; index++) {
    const datum = filteredTableDate[index];
    tableHtml += '<tr>';
    tableHtml += `<td class="border border-gray-200 p-1 px-2 font-semibold">${datum.type}</td>`;
    tableHtml += `<td class="border border-gray-200 p-1 px-2">${createTimeString(new Date(datum.timestamp))}</td>`;
    tableHtml += `<td class="border border-gray-200 p-1 px-2">${datum.height}ft</td>`;
    tableHtml += '</tr>';
  }

  document.getElementById('tide-table').innerHTML = tableHtml;
}


function filterToDay(data, dayDate) {
  const lowerTimestamp = dayDate.getTime();
  const upperTimestamp = dayDate.getTime() + 24 * 60 * 60 * 1000;
  return data.filter(datum => datum.timestamp >= lowerTimestamp && datum.timestamp <= upperTimestamp);
}

function createTimeString(date) {
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

  return hour + ':' + pad2(date.getMinutes()) + '' + ampm;
}

function roundTwoDigits(number) {
  return Math.round(number * 100) / 100;
}

function getNextTide(data, currentDate) {
  const timestamp = currentDate.getTime();
  return data.find(datum => datum.timestamp > timestamp);
}

function determineTrend(data, currentDate) {
  const firstResult = getNextTide(data, currentDate);
  if (firstResult) {
    return firstResult.type.toLowerCase() === 'low' ? TideTrend.FALLING : TideTrend.RISING;
  }
  return TideTrend.NONE;
}

function plotData(data, currentDate, minDate, maxDate) {
    Highcharts.chart('chart', {

        title: {
            // text: location
            text: null
        },

        chart: {
            type: 'areaspline',
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
        },

        tooltip: {
          shared: true,
          crosshairs: true,
          formatter: function() {
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
            plotLines: [createPlotLine(currentDate)],
            min: minDate.getTime(),
            max: maxDate.getTime(),
            tickInterval: 1000 * 60 * 60 * 24,
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
            data: data,
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

    });
}