const XML_URL = "https://www.weather.gov/source/hfo/xml/SurfState.xml";
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const URL = PROXY_URL + XML_URL;

function getData() {
  return fetch(URL)
  .then(response => response.text())
  .then(text => textToDocument(text, "text/xml"))
  .then((data) => parseDocument(data));
}

function run() {
  getData()
  .then((data) => {
    console.log(data);
    return data;
  })
  .then((data) => renderData(data));
}

run();

function parseDocument(xmlDocument) {
  const items = [...xmlDocument.getElementsByTagName("item")];

  const discussion = getDiscussion(items);
  const { waveHeights, generalDayInfo } = getIslandForecast(items, 'oahu');
  return {
    discussion: discussion,
    waveHeights: waveHeights,
    generalDayInfo: generalDayInfo,
  };
}

function getDiscussion(items) {
  const discussionItem = getDiscussionItemElement(items);
  if (discussionItem) {
    const description = extractDescription(discussionItem);
    const descriptionDoc = textToDocument(description, "text/html");
    const pElements = [...descriptionDoc.getElementsByTagName("p")];
    return pElements.map(extractValue).map(text => text.trim()).filter(text => text && text.length > 0);
  }
  return [];
}

function getDiscussionItemElement(items) {
  return items.find(item => {
    const title = extractTitle(item);
    return title && "discussion" === title.toLowerCase();
  });
}

function getIslandForecast(items, island) {
  const forecastItem = getForecastItemElement(items, island);

  let generalDayInfo = [];
  let waveHeights = [];

  if (forecastItem) {
    const description = extractDescription(forecastItem);
    const descriptionDoc = textToDocument(description, "text/html");
    const tableElements = [...descriptionDoc.getElementsByTagName("table")];

    generalDayInfo = getGeneralDayInfo(descriptionDoc);

    if (tableElements.length > 0) {
      const tableElement = tableElements[0];
      waveHeights = parseForecastTable(tableElement);
    }
  }
  return {
    generalDayInfo: generalDayInfo,
    waveHeights: waveHeights,
  }
}

function getForecastItemElement(items, location) {
  return items.find(item => {
    const title = extractTitle(item);
    return title && title.toLowerCase().includes('forecast') && title.toLowerCase().includes(location.toLowerCase());
  });
}

function getGeneralDayInfo(descriptionDoc) {
  const generalDivs = getAsList(descriptionDoc, "div");
  const dayInfo = [];
  for (let divIndex = 0; divIndex < generalDivs.length; divIndex++) {
    const generalDiv = generalDivs[divIndex];
    
    const dayJson = parseGeneralDiv(generalDiv);
    dayInfo.push(dayJson);
  }
  return dayInfo;
}

function parseGeneralDiv(generalDiv) {
  const day = extractFirstValue(generalDiv, "span");
  let weather = '';
  let temperature = '';
  let winds = '';

  const tableElement = getFirst(generalDiv, "table");
  if (tableElement) {
    const rows = getRows(tableElement);
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const headerValue = extractFirstValue(row, "th");
      if (headerValue) {
        if (headerValue.toLowerCase().includes('weather')) {
            weather = extractFirstValue(row, "td").trim();
        }
        else if (headerValue.toLowerCase().includes('temperature')) {
          temperature = extractFirstValue(row, "td").trim();
        }
        else if (headerValue.toLowerCase().includes('winds')) {
          winds = extractFirstValue(row, "td").trim();
        }
      }
    }
  }

  return {
    day: day,
    weather: weather,
    temperature: temperature,
    winds: winds,
  };
}

function renderData(data) {
  const {discussion, waveHeights, generalDayInfo} = data;

  document.getElementById('description').innerHTML = discussion.join('<br><br>');

  document.getElementById('day-metadata').innerHTML = createMetadataHtml(generalDayInfo);

  document.getElementById('north-table').innerHTML = createTable(filterDataToDirection(waveHeights, 'north'));
  document.getElementById('west-table').innerHTML = createTable(filterDataToDirection(waveHeights, 'west'));
  document.getElementById('south-table').innerHTML = createTable(filterDataToDirection(waveHeights, 'south'));
  document.getElementById('east-table').innerHTML = createTable(filterDataToDirection(waveHeights, 'east'));
}

function createMetadataHtml(generalDayInfo) {
  let html = '<table class="text-left text-sm">';
  html += '<tr class="bg-gray-600 text-white text-xs">';
  html += `<th></th>`
  for (let dayInfoIndex = 0; dayInfoIndex < generalDayInfo.length; dayInfoIndex++) {
    const dayInfo = generalDayInfo[dayInfoIndex];
    html += `<th class="p-1 px-2">${dayInfo.day}</th>`
  }
  html += '</tr>';
  
  html += '<tr class="bg-gray-50">';
  html += `<td class="font-semibold border border-gray-100 p-1 px-2 text-xs">Weather</td>`
  for (let dayInfoIndex = 0; dayInfoIndex < generalDayInfo.length; dayInfoIndex++) {
    const dayInfo = generalDayInfo[dayInfoIndex];
    html += `<td class="border border-gray-100 p-1 px-2">${dayInfo.weather}</td>`
  }
  html += '</tr>';
  
  html += '<tr>';
  html += `<td class="font-semibold border border-gray-100 p-1 px-2 text-xs">Temperature</td>`
  for (let dayInfoIndex = 0; dayInfoIndex < generalDayInfo.length; dayInfoIndex++) {
    const dayInfo = generalDayInfo[dayInfoIndex];
    html += `<td class="border border-gray-100 p-1 px-2">${dayInfo.temperature}</td>`
  }
  html += '</tr>';
  
  html += '<tr class="bg-gray-50">';
  html += `<td class="font-semibold border border-gray-100 p-1 px-2 text-xs">Winds</td>`
  for (let dayInfoIndex = 0; dayInfoIndex < generalDayInfo.length; dayInfoIndex++) {
    const dayInfo = generalDayInfo[dayInfoIndex];
    html += `<td class="border border-gray-100 p-1 px-2">${dayInfo.winds}</td>`
  }
  html += '</tr>';

  html += '</table>';
  return html;
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
    html += `<div class="block text-sm w-full">${dataForDay[0].day}</div>`;

    html += '<div class="flex space-x-0.5">';
    for (let singleForecastIndex = 0; singleForecastIndex < dataForDay.length; singleForecastIndex++) {
      const singleForecast = dataForDay[singleForecastIndex];
      const averageHeight = singleForecast.averageHeight;
      const baseColor = getHeightColor(averageHeight);

      const bgColor = `bg-${baseColor}-300`;
      const bgColorLight = `bg-${baseColor}-50`;
      
      html += `<div class="inline-block p-0 m-0 flex-1">`;
      html += `  <div class="w-full text-xs text-white ${bgColor} p-1 px-2 md:px-3">${singleForecast.time}</div>`;
      html += `  <div class="w-full text-base ${bgColorLight} p-1 px-2 md:px-3"><span class="font-semibold">${singleForecast.height}</span> <span class="font-extralight">FT</span></div>`;
      html += `</div>`;
    }
    html += '</div>';
    
    html += '</div>';
  }

  return html;
}

function getHeightColor(heightValue) {
  if (heightValue > 8) {
    return 'red';
  }
  else if (heightValue >= 6) {
    return 'yellow';
  }
  else if (heightValue >= 4) {
    return 'blue';
  }
  return 'gray';
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

        const heightString = cellValue;
        const heightStrings = heightString.split('-');

        let heightValues = heightStrings.map(height => parseInt(height));

        const minHeight = Math.min(...heightValues);
        const maxHeight = Math.max(...heightValues);
        const totalValue = heightValues.reduce((total, current) => total += current, 0);
        const averageHeight = totalValue / heightStrings.length;

        results.push({
          'direction': direction,
          'day': days[dayIndex],
          'time': times[timeIndex],
          'height': heightString,
          'minHeight': minHeight,
          'maxHeight': maxHeight,
          'averageHeight': averageHeight,
          'order': timeIndex,
        });
      }
    }
  }

  return results;
}

function getRows(tableElement) {
  return getAsList(tableElement, "tr");
}

function getHeaders(tableRowElement) {
  return getAsList(tableRowElement, "th");
}

function getCells(tableRowElement) {
  return getAsList(tableRowElement, "td");
}

function extractTitle(itemElement) {
  return extractFirstValue(itemElement, "title");
}

function extractDescription(itemElement) {
  return extractFirstValue(itemElement, "description");
}

// General helpers for working with the document
function textToDocument(text, mimeType) {
  return (new window.DOMParser()).parseFromString(text, mimeType);
}

function getAsList(element, tagName) {
  return [...element.getElementsByTagName(tagName)];
}

function getFirst(element, tagName) {
  const foundValues = getAsList(element, tagName);
  if (foundValues && foundValues.length > 0) {
    return foundValues[0];
  }
  return null;
}

function extractFirstValue(itemElement, tagName) {
  const first = getFirst(itemElement, tagName);
  return first ? extractValue(first) : null;
}

function extractValue(element) {
  if (element) {
    return element.textContent;
  }
  return null;
}