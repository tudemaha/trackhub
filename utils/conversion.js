const duration = (durationStamp) => {
    // get string after "PT"
    durationStamp = durationStamp.split("PT")[1];

    let minute = '';
    let second = '';

    if(durationStamp.includes("M")) {
        [minute, durationStamp] = durationStamp.split("M");
    }
    second = durationStamp.split("S")[0];
    return minute.padStart(2, '0') + ":" + second.padStart(2, '0');
}

const timezone = (timestamp,locale, zone) => {
    const options = {
        hour12: false,
        timeZone: zone,
        dateStyle: 'medium',
        timeStyle: 'long'

    }
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(locale, options).format(date);
}

module.exports = {duration, timezone};