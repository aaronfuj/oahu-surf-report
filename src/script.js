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

    const reducedResults = latestPoints(results);
    const slope = calculateSlope(latestDay(reducedResults));

    const increasingSlope = slope > 1;
    const decreasingSlope = slope < -1;

    const slopeCharacter = increasingSlope ? '▲' : (decreasingSlope ? '▼' : '');
    const trendElement = document.getElementById('trend-' + location);
    trendElement.innerHTML = slopeCharacter;
    if (increasingSlope) {
        trendElement.classList.add("text-green-500");
    }
    else if (decreasingSlope) {
        trendElement.classList.add("text-red-500");
    }

    var series = createSeries(reducedResults);
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

function latestPoints(parsedValues) {
    return parsedValues.slice(0, Math.max((5 * 24 * 2), 0));
}

function latestDay(parsedValues) {
    return parsedValues.slice(0, Math.max((24 * 2), 0));
}

// Calculate the slope using linear regression, with the end result being an expected result of
// Ft/day.
function calculateSlope(parsedValues) {
    const ascendingValues = parsedValues.reverse();
    const firstTime = extractDate(ascendingValues[0]).getTime();

    const sum = (accumulator, currentValue) => accumulator + currentValue;
    const sumSquares = (accumulator, currentValue) => accumulator + (currentValue*currentValue);

    // converts the time interval into minutes, meaning the slope can be considered feet/min
    const timeValue = (value) => (extractDate(value).getTime() - firstTime) / 1000 / 60;

    const xValues = ascendingValues.map(timeValue);
    const yValues = ascendingValues.map(value => extractWaveHeight(value));
    const xTimesYValues = ascendingValues.map(value => timeValue(value) * extractWaveHeight(value));

    let xSummed = xValues.reduce(sum);
    let xSquaredSummed = xValues.reduce(sumSquares);
    let ySummed = yValues.reduce(sum);
    let xTimesYValuesSummed = xTimesYValues.reduce(sum);

    let n = ascendingValues.length;
    let numerator = (n * xTimesYValuesSummed) - (xSummed * ySummed);
    let denominator = (n * xSquaredSummed) - (xSummed * xSummed);

    // Convert the end usable slope into ft/day
    return (numerator / denominator) * 60 * 24;
}

function createSeries(parsedValues) {
    const series = parsedValues.map(value => {
        const timestamp = extractDate(value);
        const yValue = extractWaveHeight(value);
        return [timestamp.getTime(), yValue];
    }).reverse();

    return series;
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