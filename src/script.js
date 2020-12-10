const proxiedUrl = "https://www.ndbc.noaa.gov/data/realtime2";
const barbersPointUrl = "/api/51212.txt";
const waimeaUrl = "/api/51201.txt";

function getData(url, location) {
    const utf8Decoder = new TextDecoder('utf-8');
    return fetch(url)
        .then((response) => {
            const text = response.text();
            return text;
        })
        .then((data) => {
            return parseTextFile(data);
        })
        .then((results) => {
            handleResults(results, location);
        });
}

getData(barbersPointUrl, 'barbers');
getData(waimeaUrl, 'waimea');

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        var results = parseTextFile(contents);
        handleResults(results, 'barbers');
    };
    reader.readAsText(file);
}

function handleResults(results, location) {
    console.log(results);

    const latestData = getLatestValues(results);
    const lastDate = formatDate(extractDate(latestData));
    const lastWaveHeight = extractWaveHeight(latestData);

    document.getElementById('latest-timestamp-' + location).innerHTML = lastDate;
    document.getElementById('latest-wave-height-' + location).innerHTML = lastWaveHeight;


    var series = createSeries(results);
    console.log(series);

    plotData(series, location);
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
        for (var valueIndex = 0; valueIndex < values.length; valueIndex++) {
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
    const series = parsedValues.map(value => {
        const timestamp = extractDate(value);
        const yValue = extractWaveHeight(value);
        return [timestamp.getTime(), yValue];
    }).reverse();

    // Only grab latest 7 days (with an expected 30 minute interval)
    return series.slice(Math.max(series.length - 336, 0))
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

function formatDate(date) {
    return date.toDateString() + " " +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
}

function extractWaveHeight(value) {
    return convertMetersToFeet(parseFloat(value["WVHT"].value));
}

function toDate(year, month, day, hour, minute) {
    const dateString = "" + year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00Z";
    return new Date(dateString);
}

function plotData(data, location) {
    Highcharts.chart('chart-' + location, {

        title: {
            // text: location
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
            data: data
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

document.getElementById('file-input').addEventListener('change', readSingleFile, false);