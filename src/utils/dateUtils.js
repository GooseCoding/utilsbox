
/**
 * Get yyyy-MM-dd hh:mm:ss
 * @returns 
 */
const getCurrentTime = () => {
    var time = new Date();
    return yyyy_MM_dd_hh_mm_ss(time);
}

const yyyy_MM_dd_hh_mm_ss = (time) => {
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    let add0 = (num) => { return num < 10 ? '0' + num : num }
    return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}

/**
 * 获取当前时间戳
 * @param {*} unit 
 * @returns 
 */
const getTimeStamp = (unit) => {
    let result = new Date().getTime();
    if (unit === 'second') {
        return (result + '').substring(0, 10);
    } else {
        return result;
    }
}

/**
 * 时间戳转时间
 * @param {*} timeStamp 
 * @returns 
 */
const timeStampToTime = (timeStamp, unit) => {
    let date;
    try {
        if (unit === 'second') {
            timeStamp += '000';
        }
        let numTimeStamp = parseInt(timeStamp);
        date = new Date(numTimeStamp);
    } catch {
        date = new Date(timeStamp);
    }
    return yyyy_MM_dd_hh_mm_ss(date);
}

export default {
    getCurrentTime: getCurrentTime,
    getTimeStamp: getTimeStamp,
    timeStampToTime: timeStampToTime
}
