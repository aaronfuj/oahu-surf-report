const BASE_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

function buildPath(stationId, currentDate, days) {
  const startDate = toDateRequestString(currentDate);
  const hourRange = days * 24;

  return (
    BASE_URL +
    "?" +
    "product=predictions" +
    "&station=" +
    stationId +
    "&application=FreeForecast" +
    "&begin_date=" +
    startDate +
    "&range=" +
    hourRange +
    "&datum=MLLW" +
    "&time_zone=gmt" +
    "&units=english" +
    "&interval=hilo" +
    "&format=json"
  );
}

function parseApiData(apiData) {
  if (apiData && apiData.predictions) {
    return apiData.predictions.map((datum) => {
      const date = toDate(datum.t);
      return {
        dateString: datum.t,
        date: date,
        timestamp: date.getTime(),
        originalType: datum.type,
        type: toTypeString(datum.type),
        height: roundTwoDigits(parseFloat(datum.v)),
      };
    });
  }

  return [];
}

function toDate(dateString) {
  //Input dateString: "2021-01-01 23:34"
  //ISO Format: 2021-01-02T06:33:49Z
  const modifiedDateString = dateString.trim().split(" ").join("T") + ":00Z";
  return new Date(modifiedDateString);
}

function toTypeString(type) {
  if (type) {
    switch (type.toUpperCase()) {
      case "L":
        return "Low";
      case "H":
        return "High";
      default:
        return type;
    }
  }
  return "";
}

function toDateRequestString(date) {
  return (
    "" +
    date.getFullYear() +
    "" +
    pad2(date.getMonth() + 1) +
    "" +
    pad2(date.getDate())
  );
}

function roundTwoDigits(number) {
  return Math.round(number * 100) / 100;
}

function pad2(number) {
  return (number < 10 ? "0" : "") + number;
}

export function getData(stationId, currentDate, days) {
  const url = buildPath(stationId, currentDate, days);

  return fetch(url)
    .then((response) => response.json())
    .then((jsonData) => parseApiData(jsonData));
}
