
/**
 * 判断对象里指定的参数列表，等于undefined或者空字符，只要有一项，即返回true
 * @param {*} obj 
 * @param {*} keys 
 * @returns 
 */
const isEmptyByObj = (obj, keys) => {
    for (let key of keys) {
        if (isEmpty(obj[key]) === true) {
            return true;
        }
    }
    return false;
}

/**
 * 空字符判断
 * @param {*} value 
 * @returns 
 */
const isEmpty = (value) => {
    return value === undefined || (value + '').trim().length === 0
}

/**
 * 判断不等于undefined或者空字符
 * @param {*} v 
 * @returns 
 */
const isNotBlack = (v) => {
    if (v && v.trim().length > 0) {
        return true;
    } else {
        return false;
    }
}

export default {
    isEmptyByObj: isEmptyByObj,
    isEmpty: isEmpty,
    isNotBlack: isNotBlack
}