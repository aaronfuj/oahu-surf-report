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

function getData() {
  const currentDate = new Date();
  const startDate = toDateString(currentDate);

  console.log(currentDate);

  const url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?" +
    "product=predictions" +
    "&application=NOS.COOPS.TAC.WL" +
    "&begin_date=" + startDate +
    "&range=96" +
    "&datum=MLLW" +
    "&station=1612340" +
    "&time_zone=gmt" +
    "&units=english" +
    "&interval=hilo" +
    "&format=json";

  fetch("https://cors-anywhere.herokuapp.com/https://www.weather.gov/source/hfo/xml/SurfState.xml")
  .then(response => response.text())
  .then(text => textToDocument(text, "text/xml"))
  .then((data) => {
    console.log(data);
    getDescription(data);
    return data;
  });
}

getData();

function getDescription(xmlDocument) {
  const items = [...xmlDocument.getElementsByTagName("item")];
  const discussionItems = items.filter(item => {
    const title = extractTitle(item);
    return title && "discussion" === title.toLowerCase();
  });

  if (discussionItems.length > 0) {
    const description = extractDescription(discussionItems[0]);
    console.log(description);

    const descriptionDoc = textToDocument(description, "text/html");
    console.log(descriptionDoc);

    const pElements = [...descriptionDoc.getElementsByTagName("p")];
    const paragraphs = pElements.map(extractValue).map(text => text.trim()).filter(text => text && text.length > 0);
    console.log(paragraphs);

    document.getElementById('description').innerHTML = paragraphs.join('<br>');
  }

  const forecastItems = items.filter(item => {
    const title = extractTitle(item);
    return title && title.toLowerCase().includes('forecast') && title.toLowerCase().includes('oahu');
  });

  if (forecastItems.length > 0) {
    const forecastItem = forecastItems[0];
    const description = extractDescription(forecastItem);
    console.log(description);

    const descriptionDoc = textToDocument(description, "text/html");
    console.log(descriptionDoc);

    const tableElements = [...descriptionDoc.getElementsByTagName("table")];
    if (tableElements.length > 0) {
      const table = tableElements[0];
      const forecastJson = parseForecastTable(table);
      console.log(forecastJson);

      document.getElementById('tableJson').innerHTML = JSON.stringify(forecastJson);

      document.getElementById('north-table').innerHTML = createTable(filterDataToDirection(forecastJson, 'north'));
      document.getElementById('west-table').innerHTML = createTable(filterDataToDirection(forecastJson, 'west'));
      document.getElementById('south-table').innerHTML = createTable(filterDataToDirection(forecastJson, 'south'));
      document.getElementById('east-table').innerHTML = createTable(filterDataToDirection(forecastJson, 'east'));
    }
  }
}

function filterDataToDirection(forecastJson, direction) {
  return forecastJson.filter(datum => datum.direction && datum.direction.toLowerCase().includes(direction.toLowerCase()));
}

function groupDataByDay(forecastJson) {
  return forecastJson.reduce((result, currentValue) => {
    if (result.length === 0) {
      const currentDay = [];
      currentDay.push(currentValue);
      result.push(currentDay);
    }
    else {
      const latestDay = result[result.length-1];
      if (latestDay[0].day === currentValue.day) {
        latestDay.push(currentValue);
      }
      else {
        const newDay = [];
        newDay.push(currentValue);
        result.push(newDay);
      }
    }
    return result;
  }, []);
}

function createTable(forecastJson) {
  const databyDay = groupDataByDay(forecastJson);

  console.log(databyDay);
  
  let html = '';
  for (let dayIndex = 0; dayIndex < databyDay.length; dayIndex++) {
    const dataForDay = databyDay[dayIndex];

    html += '<div class="p-0 inline-block flex-1">';
    html += `<div class="block font-semibold w-full">${dataForDay[0].day}</div>`;

    html += '<div class="flex space-x-0.5">';
    for (let singleForecastIndex = 0; singleForecastIndex < dataForDay.length; singleForecastIndex++) {
      const singleForecast = dataForDay[singleForecastIndex];
      
      html += `<div class="inline-block p-0 m-0 flex-1">`;
      html += `  <div class="w-full text-xs text-white bg-blue-300 p-1 px-4">${singleForecast.time}</div>`;
      html += `  <div class="w-full text-medium p-1">${singleForecast.height} ft</div>`;
      html += `</div>`;
    }
    html += '</div>';
    
    html += '</div>';
  }

  return html;
}

function parseForecastTable(tableElement) {

  const rows = getRows(tableElement);

  const days = [];
  const times = [];
  const results = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    
    const headers = getHeaders(row);
    if (headers.length > 0) {
      for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
        const header = headers[headerIndex];
        const headerValue = extractValue(header).trim();

        if (headerValue.toLowerCase().includes('shore')) {
          continue;
        }
        else if (headerValue.toLowerCase().includes('day') || headerValue.toLowerCase().includes('night')) {
          days.push(headerValue);
        }
        else if (headerValue.toLowerCase().includes('am') || headerValue.toLowerCase().includes('pm')) {
          times.push(headerValue);
        }
      }
    }

    const cells = getCells(row);
    let direction = '';
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
      const cell = cells[cellIndex];
      const cellValue = extractValue(cell).trim();
      
      if (cellValue.toLowerCase().includes('facing')) {
        direction = cellValue;
      }
      else {
        const dayIndex = Math.floor((cellIndex-1) / 2);
        const timeIndex = cellIndex-1;
        results.push({
          'direction': direction,
          'day': days[dayIndex],
          'time': times[timeIndex],
          'height': cellValue,
          'order': timeIndex,
        });
      }
    }
  }

  return results;
}

function getRows(tableElement) {
  return [...tableElement.getElementsByTagName("tr")]
}

function getHeaders(tableRowElement) {
  return [...tableRowElement.getElementsByTagName("th")]
}

function getCells(tableRowElement) {
  return [...tableRowElement.getElementsByTagName("td")]
}

function textToDocument(text, mimeType) {
  return (new window.DOMParser()).parseFromString(text, mimeType);
}

function extractTitle(itemElement) {
  return extractValue(itemElement.getElementsByTagName("title")[0]);
}

function extractDescription(itemElement) {
  return extractValue(itemElement.getElementsByTagName("description")[0]);
}

function extractValue(element) {
  if (element) {
    return element.textContent;
  }
  return null;
}

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
              hour = date.getHours();
              ampm = 'AM';
              
              if (hour == 12){
                ampm = 'PM'
              }
              if (hour == 0){
                hour = 12;
              }
              if (hour > 12){
                hour = hour - 12;
                ampm = 'PM'
              }

              // var datestring = pad2(hour) + ':' + pad2(date.getMinutes()) + ' ' + ampm + '<br/>' + (date.getMonth() + 1) + '/' + date.getDate();
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