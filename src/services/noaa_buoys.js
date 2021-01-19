function parseTextFile(stringValue) {
  const lines = stringValue.split("\n");

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
        units: units[valueIndex],
      };
    }
    parsedValues.push(object);
  }

  return parsedValues;
}

function tokenize(line) {
  return line.split(/(\s+)/).filter((token) => token.trim().length > 0);
}

function parseGenericJsonStructure(jsonData) {
  return jsonData.map((value) => {
    const date = toDate(
      value["YY"].value,
      value["MM"].value,
      value["DD"].value,
      value["hh"].value,
      value["mm"].value
    );
    const significantWaveHeight = parseFloat(value["WVHT"].value);

    return {
      date: date,
      timestamp: date.getTime(),
      significantWaveHeightFt: convertMetersToFeet(significantWaveHeight),
      original: value,
    };
  });
}

function convertMetersToFeet(value) {
  // Convert meters to feet, but also round to 2 digits (A higher performance method of truncating to 2 digits)
  return Math.round(value * 3.28084 * 100) / 100;
}

function toDate(year, month, day, hour, minute) {
  const dateString =
    "" + year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00Z";
  return new Date(dateString);
}

export function getData(buoyId) {
  return fetch(`/api/${buoyId}.txt`)
    .then((response) => {
      if (!response.ok) {
        return [];
      } else {
        return response.text().then((text) => parseTextFile(text));
      }
    })
    .then(parseGenericJsonStructure);
}
