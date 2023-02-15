/**
 * 删除list里，所有 item[key]=value 的数据
 * @param {object[]} list 
 * @param {*} key 
 * @param {*} value 
 * @returns 
 */
const removeKV = (list, key, value) => {
    let newList = [];
    let removeList = [];
    for (let row of list) {
        if (row[key] !== value) {
            newList.push(row);
        } else {
            removeList.push(row);
        }
    }

    // 直接在原列表上更新
    list.splice(0, list.length);
    for (let row of newList) {
        list.push(row);
    }

    // 返回被删除的部分
    return removeList;
}

/**
 * 获取list里，第一条 item[key]=value 的数据
 * @param {object[]} list 
 * @param {*} key 
 * @param {*} value 
 * @returns 
 */
const getKV = (list, key, value) => {
    for (let row of list) {
        if (row[key] === value) {
            return row
        }
    }
    return null;
}

/**
 * 获取list里，第一条 value=target 的数据
 * @param {[]} list 
 * @param {*} target 
 * @returns 
 */
const contains = (list, target) => {
    for (let value of list) {
        if (value === target) {
            return true
        }
    }
    return false;
}

/**
 * 获取list里，第一条 value=target 的数组下标
 * @param {[]} list 
 * @param {*} value 
 * @returns 
 */
const getValueIndex = (list, value) => {
    for (let i = 0; i < list.length; i++) {
        if (value === list[i]) return i;
    }
    return -1;
}

/**
 * 获取list里， item[key] 的所有数据
 * @param {[]} list 
 * @param {*} key 
 * @returns 
 */
const getAppointKeyAllValue = (list, key) => {
    let values = [];
    for (let obj of list) {
        values.push(obj[key]);
    }
    return values;
}


export default {
    removeKV: removeKV,
    getKV: getKV,
    contains: contains,
    getValueIndex: getValueIndex,
    getAppointKeyAllValue: getAppointKeyAllValue
}
