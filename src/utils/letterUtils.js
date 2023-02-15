const capital = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const lowercase = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
const capitalMap = {}
const lowercaseMap = {}


/**
 * 全量大写转小写，且去掉空格
 * @param {*} value 
 */
const toLowercaseAndTrim = (value) => {
    if (!value) return;
    getCapitalMap();

    let valueSplit = value.split('');
    let newValue = '';
    for (let item of valueSplit) {
        if (item !== ' ') {
            newValue += firstLeft(capitalMap[item], item);
        }
    }
    return newValue;
}

/**
 * 大写字面映射小写字母Map
 * @returns 
 */
const getCapitalMap = () => {
    if (!capitalMap.A) {
        for (let i = 0; i < capital.length; i++) {
            capitalMap[capital[i]] = lowercase[i]
        }
    }
    return capitalMap;
}

/**
 * 小写字母映射大写字母Map
 * @returns 
 */
const getLowercaseMap = () => {
    if (!lowercaseMap.a) {
        for (let i = 0; i < lowercase.length; i++) {
            lowercaseMap[lowercase[i]] = capital[i]
        }
    }
    return lowercaseMap;
}


const firstLeft = (value, defaultV) => {
    return value ? value : defaultV;
}

/**
 * 下划线转驼峰
 * @param {*} text 
 * @returns 
 */
const underlineToHump = (text) => {
    if(!text) return text;

    let textSp = text.split('_');
    let result = textSp[0];
    for (let i = 1; i < textSp.length; i++) {
        let item = textSp[i];
        result += initialsToCapital(item);
    }
    return result;
}


/**
 * 驼峰转下划线
 * @param {*} text 
 * @returns 
 */
const humpTounderline = (text) => {
    if(!text) return text;

    let textSp = text.split('');
    let result = textSp[0];
    for (let i = 1; i < textSp.length; i++) {
        let item = textSp[i];
        if(getCapitalMap()[item]){
            result += `_${getCapitalMap()[item]}`;
        }else{
            result += item;
        }
    }
    return result;
}

/**
 * 首字母转大写
 * @param {*} text 
 * @returns 
 */
const initialsToCapital = (text) => {
    return initialsConvert(text, getLowercaseMap());
}

/**
 * 首字母转小写
 * @param {*} text 
 * @returns 
 */
const initialsToLowercase = (text) => {
    return initialsConvert(text, getCapitalMap());
}

const initialsConvert = (text, map) => {
    if(!text) return text;
    
    let _one = text.substring(0, 1);
    let one = map[_one];
    if (!one) {
        return text;
    }
    let after = text.substring(1, text.length);
    return one + after;
}

/**
 * 全量转大写
 * @param {*} v 
 * @returns 
 */
const allCapital = (v) => {
    return allConvert(v, getLowercaseMap());
}

/**
 * 全量转小写
 * @param {*} v 
 * @returns 
 */
const allLowercase = (v) => {
    return allConvert(v, getCapitalMap());
}

/**
 * 全量转换，根据map决定转换的内容
 * @param {*} v 
 * @param {*} map 
 * @returns 
 */
const allConvert = (v, map) => {
    if(!v) return v;
    let list = v.split('');
    let result = '';
    for(let item of list){
        let c = map[item];
        result += c ? c : item;
    }
    return result;
}


export default {
    toLowercaseAndTrim: toLowercaseAndTrim,
    underlineToHump: underlineToHump,
    humpTounderline: humpTounderline,
    initialsToCapital: initialsToCapital,
    initialsToLowercase: initialsToLowercase,
    allCapital: allCapital,
    allLowercase: allLowercase
}
