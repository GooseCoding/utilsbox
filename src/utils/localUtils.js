
/**
 * 复制
 * @param {*} content 复制的内容
 * @param {*} success 复制成功的回调
 * @param {*} fail 复制失败的回调
 */
const copy = (content, success, fail) => {
    let copyStatus = customCopy(content);
    // 判断成功与否
    if (copyStatus) {
        if (success) success();
    } else {
        if (fail) fail();
    }
}


/**
 * 复制
 * @param {*} content 复制的内容
 * @param {*} success 复制成功的回调
 * @param {*} fail 复制失败的回调
 */
const customCopy = (content, componentName) => {
    // 动态添加一个textarea组件，用于复制内容使用
    let textarea = document.createElement(componentName ? componentName : 'textarea');
    // 设置要复制的内容
    textarea.value = content;
    // 设置成悬浮透明的，视觉上不可见
    textarea.style = 'opacity: 0; position: fixed';
    // 添加到当前document中
    document.body.appendChild(textarea);
    console.log(componentName, textarea, content)

    // 创建range和selection
    let range = document.createRange();
    let selection = window.getSelection();
    //清除页面中已有的选中
    selection.removeAllRanges();
    // 设置需要复制的组件
    range.selectNode(textarea);
    // 执行选中操作
    selection.addRange(range);
    // 执行copy操作
    let copyStatus = document.execCommand("Copy");

    // 清除选中内容
    window.getSelection().removeAllRanges();
    // 删除复制时动态创建的textarea组件
    document.body.removeChild(textarea);

    return copyStatus;
}



/**
 * 导入
 * @param {*} success 成功的回调
 * @param {*} fail 失败的回调
 */
const importFile = (success, fail) => {
    // 动态添加一个textarea组件，用于复制内容使用
    let input = document.createElement('input');
    // 设置为选取文件的类型
    input.type = 'file';
    // 设置成悬浮透明的，视觉上不可见
    input.style = 'opacity: 0; position: fixed';
    // 是否点击了确认按钮
    let isClickOk = false;
    // 设置选取文件确定时触发的事件
    input.onchange = (e) => {

        isClickOk = true;
        if (!e.target.files || e.target.files.length === 0) {
            if (fail) fail({ errorCode: 'no_select_file', errorMessage: '请选择一个文件' });
            removeChild(input);
            return;
        }

        // 选中的文件
        let file = e.target.files[0];
        // 新建FileReader
        let reader = new FileReader();
        // 读取文件(以纯文本的形式返回文件内容)
        reader.readAsText(file, "UTF-8");
        // 监听读取完成的回调
        reader.onload = (e) => {
            // 文件内容字符串
            let json = e.target.result;
            console.log('读取结果', json);
            if (success) success(json);
            removeChild(input);
        }
        reader.onerror = (e) => {
            if (fail) fail({ errorCode: 'file_reader_error', errorMessage: '读取文件出错', e: e });
            removeChild(input);
        }
    };

    // 监听焦点消失，判断是否点击了取消按钮 (这个方案不太严谨，因为focus比onchange触发先，)
    window.addEventListener(
        'focus',
        () => {
            // 1秒后判断点击的是确认还是取消
            setTimeout(() => {
                if (isClickOk === false) {
                    // 点击取消，删除组件
                    removeChild(input);
                }
            }, 1000);
        },
        { once: true }
    )

    // 添加到当前document中
    document.body.appendChild(input);

    // 主动模拟点击
    input.click();
}

const removeChild = (child) => {
    try{
        console.log('删除组件', child);
        document.body.removeChild(child);
    }catch{
        console.log('删除组件异常', child);
    }
}

/**
 * 保存json文件到本地
 * @param {*} data JSON数据
 * @param {*} fileName 文件名
 */
const saveJson = (data, fileName) => {
    // 1、配置内容转字符串
    let content = JSON.stringify(data);
    // 2、创建一个a链接dom
    let dom = document.createElement('a');
    // 设置成悬浮透明的，视觉上不可见
    dom.style = 'opacity: 0; position: fixed';
    // 3、设置文件名
    dom.download = fileName + '.json';
    // 4、设置文件内容
    dom.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    // 5、添加a链接dom
    document.body.appendChild(dom);
    // 6、触发点击
    dom.click();
    // 删除a链接dom
    document.body.removeChild(dom);
}

export default {
    copy: copy,
    saveJson: saveJson,
    importFile: importFile,
    customCopy: customCopy
}