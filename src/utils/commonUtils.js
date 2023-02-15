
/**
 * 判断对象里指定的参数列表，等于undefined或者null，只要有一项，即返回true
 * @param {*} obj 
 * @param {*} keys 
 * @returns 
 */
const isEmptyByObj = (obj, keys) => {
    for (let key of keys) {
        if (obj[key] === undefined || obj[key] === null) {
            return true;
        }
    }
    return false;
}

export default {
    isEmptyByObj: isEmptyByObj,
}