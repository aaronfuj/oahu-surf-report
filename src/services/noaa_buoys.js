function buildRelativePath(buoyId) {
    return `/api/${buoyId}.txt`;
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

function tokenize(line) {
    return line.split(/(\s+)/).filter(token => token.trim().length > 0);
}

export function getData(buoyId) {
    return fetch(buildRelativePath(buoyId))
    .then((response) => {
        if (!response.ok) {
            return [];
        }
        else {
            return response.text().then(text => parseTextFile(text));
        }
    });
}