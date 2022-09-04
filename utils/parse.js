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

module.exports = {duration};