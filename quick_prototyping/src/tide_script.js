const HONOLULU =   { id: '1612340', name: 'Honolulu' };
const NAWILIWILI = { id: '1611400', name: 'Nawiliwili' };
const WAIMANALO =  { id: '1612376', name: 'Waimanalo' };
const WAIANAE =    { id: '1612482', name: 'Waianae' };
const WAIMEA_BAY = { id: '1611401', name: 'Waimea Bay' };

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

function toDateString(date) {
  return "" + date.getFullYear() + "" + (date.getMonth()+1) + "" + pad2(date.getDate());
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getData(station) {
  const currentDate = new Date();
  const startDate = toDateString(currentDate);

  console.log(currentDate);

  const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?" +
    "product=predictions" +
    "&application=NOS.COOPS.TAC.WL" +
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
    renderTable(data, dayDate);
    return createSeries(data);
  })
  .then((data) => {
    console.log(data);
    plotData(data, currentDate, new Date(currentDate.toDateString()), new Date(currentDate.addDays(3).toDateString()));
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
    color: '#96ff96',
    width: 2,
    value: date.getTime(),
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

function renderTable(apiData, dayDate) {
  const tableData = apiData.predictions.map(datum => {
    return {
      timestamp: toDate(datum.t + "Z").getTime(),
      type: toTypeString(datum.type),
      height: roundTwoDigits(parseFloat(datum.v))
    };
  });

  const filteredTableDate = filterToDay(tableData, dayDate);
  let tableHtml = '<table>';
  for (let index = 0; index < filteredTableDate.length; index++) {
    const datum = filteredTableDate[index];
    tableHtml += '<tr>';
    tableHtml += `<td>${datum.type}</td><td>${createTimeString(new Date(datum.timestamp))}</td><td>${datum.height}ft</td>`;
    tableHtml += '</tr>';
  }
  tableHtml += '</table>';

  document.getElementById('table').innerHTML = tableHtml;
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

  return pad2(hour) + ':' + pad2(date.getMinutes()) + '' + ampm;
}

function roundTwoDigits(number) {
  return Math.round(number * 100) / 100;
}

function plotData(data, currentDate, minDate, maxDate) {
    Highcharts.chart('chart', {

        title: {
            // text: location
            text: null
        },

        chart: {
            type: 'spline',
            zoomType: 'x',
            height: 100
        },

        yAxis: {
            title: {
                text: 'Height (ft)'
            },
            min: -0.5,
            max: 2.5,
            tickInterval: 1,
            startOnTick: false,
            endOnTick: false
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
              formatter: function() {
              var date = new Date(this.value);
              var datestring = (date.getMonth() + 1) + '/' + date.getDate();
              return datestring;
            },
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