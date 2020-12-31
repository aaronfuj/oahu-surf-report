// const XML_URL = "https://www.weather.gov/source/hfo/xml/SurfState.xml";
// const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const PRODUCTION_URL = "/noaa_xml/SurfState.xml";
const URL = PRODUCTION_URL;

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

  export function getData() {
    return fetch(URL)
    .then(response => response.text())
    .then(text => textToDocument(text, "text/xml"))
    .then((data) => parseDocument(data));
  }