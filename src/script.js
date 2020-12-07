function getData() {
    const utf8Decoder = new TextDecoder('utf-8');

    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const url = "https://www.ndbc.noaa.gov/data/realtime2/51212.txt";
    // Barber's Point
    return fetch(proxyUrl + url)
    .then((response) => {
        const text = response.text();
        return text;
    })
    .then((data) => {
        console.log(data);
        return parseTextFile(data);
    });
}

// getData();

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        var results = parseTextFile(contents);
        console.log(results);

        const latestData = getLatestValues(results);
        const lastDate = extractDate(latestData);
        const lastWaveHeight = extractWaveHeight(latestData);

        document.getElementById('latest-timestamp').innerHTML = lastDate;
        document.getElementById('latest-wave-height').innerHTML = lastWaveHeight;


        var series = createSeries(results);
        console.log(series);

        plotData(series);
    };
    reader.readAsText(file);
}

function parseTextFile(stringValue) {
    const lines = stringValue.split('\n');

    // Parse headers, removing the initial '#' symbols
    const headers = tokenize(lines[0].substring(1));
    const units = tokenize(lines[1].substring(1));

    const parsedValues = [];
    for (var i = 2; i < lines.length; i++) {
        const values = tokenize(lines[i]);

        if (values.length < headers.length) {
            continue;
        }

        let object = {};
        for (var valueIndex=0; valueIndex < values.length; valueIndex++) {
            object[headers[valueIndex]] = {
                header: headers[valueIndex],
                value: values[valueIndex],
                units: units[valueIndex]
            };
        }
        parsedValues.push(object);
    }

    return parsedValues;
}

function getLatestValues(parsedValues) {
    return parsedValues[0];
}

function createSeries(parsedValues) {
    return parsedValues.map(value => {
        const timestamp = extractDate(value);
        const yValue = extractWaveHeight(value);
        return [timestamp, yValue];
    }).reverse();
}

function tokenize(line) {
    return line.split(/(\s+)/).filter(token => token.trim().length > 0);
}

function convertMetersToFeet(value) {
    // A higher performance method of truncating to 2 digits
    return Math.round((value * 3.28084) * 100) / 100;
}

function extractDate(value) {
    return toDate(value["YY"].value, value["MM"].value, value["DD"].value, value["hh"].value, value["mm"].value);
}

function extractWaveHeight(value) {
    return convertMetersToFeet(parseFloat(value["WVHT"].value));
}

function toDate(year, month, day, hour, minute) {
    const dateString = ""+year+"-"+month+"-"+day+"T"+hour+":"+minute+":00";
    return new Date(dateString);
}

function plotData(data) {
    Highcharts.chart('chart', {

        title: {
            text: null
        },

        subtitle: {
            text: 'Source: https://www.ndbc.noaa.gov/data/realtime2/51212.txt'
        },

        chart: {
            type: 'line',
            zoomType: 'x'
        },

        yAxis: {
            title: {
                text: 'Wave Height (ft)'
            }
        },

        xAxis: {
            type: 'datetime'
        },

        // tooltip: {
        //     xDateFormat: '%A, %B %d, %Y'
        // },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            floating: true
        },

        series: [{
            name: 'Barber\'s Point',
            data: data
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });
}

document.getElementById('file-input').addEventListener('change', readSingleFile, false);