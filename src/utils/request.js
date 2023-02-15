

const get = (url, param, headers) => {
    if (param) {
        let i = 0;
        for (let k in param) {
            if (i < 1) {
                url += `?${k}=${param[k]}`;
            } else {
                url += `&${k}=${param[k]}`;
            }
            i++;
        }
    }
    return send(url, 'GET', param, headers);
}

const post = (url, param, headers) => {
    return send(url, 'POST', param, headers);
}

const send = (url, method, param, headers) => {
    if (!headers) headers = {};
    if (method === 'GET') param = undefined;

    return new Promise((resolve, reject) => {
        let _headers = {
            'content-type': 'application/json',
            ...headers
        }
        fetch(url, {
            method: method,
            body: param,
            headers: _headers
        }).then(res => {
            let isJson = false;
            for (let k in _headers) {
                if (_headers[k] && _headers[k].indexOf('application/json') >= 0) {
                    isJson = true;
                }
            }
            if (isJson === true) {
                res.json().then((data) => {
                    resolve(data, res);
                });
            } else {
                res.text().then((data) => {
                    resolve(data, res);
                });
            }

        }).catch(e => {
            reject({ errorMsg: '请求失败', errorCode: 'REQUEST_HTTP_FAIL', error: e });
        });
    })
}

export default {
    get: get,
    post: post
}
