
/**
 * 获取页面url参数
 * @param {*} key 
 * @returns 
 */
const getUrlParam = (key) => {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] === key) { return pair[1]; }
    }
    return undefined;
}

/**
 * 获取页面路径
 * @returns 
 */
const getUrlPath = () => {
    return window.location.pathname;
}

const openWindow = (url) => {
    window.open(url, '_blank');
}

const getUrl = (param) => {
    let url = window.location.origin;
    if (param) {
        let index = 0;
        for (let key in param) {
            if (index === 0) {
                url += "?" + key + "=" + param[key];
            } else {
                url += "&" + key + "=" + param[key];
            }
            index++;
        }
    }
    return url;
}

const updateUrl = (param) => {
    window.history.pushState('', '', getUrl(param));
}

const openApp = (route) => {
    window.open(getUrl({ app: route.appCode }), '_blank');
}

export default {
    getUrlParam: getUrlParam,
    getUrlPath: getUrlPath,
    openWindow: openWindow,
    getUrl: getUrl,
    updateUrl: updateUrl,
    openApp: openApp
}