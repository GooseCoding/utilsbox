import arrayUtils from "../../utils/arrayUtils";
import commonUtils from "../../utils/commonUtils";
import dateUtils from "../../utils/dateUtils";
import letterUtils from "../../utils/letterUtils";
import StringUtils from "../../utils/stringUtils";
import { DYNAMIC_PARAMS, MYSQL_DATA_TYPES } from '../../constants/tableToCode';


/**
 * 代码模版匹配动态参数和替换实际内容
 * @param {{codeTemplate: CodeTemplate, tableInfo: TableInfo}} parameter 
 * @returns 替换完成的代码内容
 */
export const matchAndReplace = (parameter) => {
    // 必填参数不可空
    if (!parameter || commonUtils.isEmptyByObj(parameter, ['codeTemplate', 'tableInfo'])) return;
    // 主体模版内容不可空
    let codeTemplate = parameter.codeTemplate;
    if (StringUtils.isNotBlack(codeTemplate.bodyCode) === false) { return }

    // 1、匹配动态参数
    let validParams = getTemplateInnerDynamicParams(codeTemplate.bodyCode);
    // 2、替换实际内容
    let codeContent = runReplacer(validParams, {
        ...parameter,
        content: codeTemplate.bodyCode,
        fieldList: parameter.tableInfo.fieldList
    });
    // 3、返回代码结果
    return codeContent;
}


/**
 * 识别建表SQL
 * 识别的办法简单粗糙，只考虑正常的格式
 * @param {string} sql 
 * @returns {TableInfo}
 */
export const distinguishCreateTableSql = (sql) => {
    // 先取行
    let rows = sql.split('\n');
    if (rows.length === 0) return;
    let table = {};

    // 取表名，按格式，表名出现在第一行第三列，需要去掉``
    let oneColumns = rows[0].split(' ');
    table.tableName = oneColumns.length >= 2 ? oneColumns[2].replaceAll('`', '') : undefined;

    // 取字段
    let fieldList = [];
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let fieldModel = {};

        // 取主键
        if (row.indexOf('PRIMARY KEY') >= 0) {
            let bracketsIndexA = row.indexOf('(');
            let bracketsIndexB = row.indexOf(')');
            if (bracketsIndexA > 0 && bracketsIndexB > 0) {
                let primaryKey = row.substring(bracketsIndexA + 1, bracketsIndexB);
                table.primaryKey = primaryKey.replaceAll('`', '');
            }
            continue;
        }

        // 切分列
        let rowTrim = row.trim();
        let columns = rowTrim.substring(0, rowTrim.length - 1).split(' ');

        // 取引擎和编码方式
        if (row.indexOf('ENGINE') >= 0) {
            for (let column of columns) {
                if (column.indexOf('ENGINE=') >= 0) {
                    table.dbEngine = column.replace('ENGINE=', '');
                }
                if (column.indexOf('CHARSET=') >= 0) {
                    table.encoded = column.replace('CHARSET=', '');
                    table.encoded = column.replace(';', '');
                }
            }
            continue;
        }

        // 取字段名
        fieldModel.field = columns[0].replaceAll('`', '');

        // 取数据类型与长度
        let typeAndLength = columns[1];
        let bracketsIndexA = typeAndLength.indexOf('(');
        let bracketsIndexB = typeAndLength.indexOf(')');
        let type = typeAndLength.substring(0, bracketsIndexA > 0 ? bracketsIndexA : typeAndLength.length);
        fieldModel.type = letterUtils.allCapital(type);
        fieldModel.javaType = dbTypeToJavaType(fieldModel.type);
        if (bracketsIndexA > 0) {
            let length = typeAndLength.substring(bracketsIndexA + 1, bracketsIndexB);
            fieldModel.length = length;
        }

        // 取是否可NULL
        fieldModel.isNull = row.indexOf('NOT NULL') > 0 ? false : true;

        // 判断是自增主键还是非自增主键
        fieldModel.primaryKey = arrayUtils.contains(columns, 'AUTO_INCREMENT') === true ? 'PRI_AUTO' : undefined;
        if (table.primaryKey === fieldModel.field && fieldModel.primaryKey !== 'PRI_AUTO') {
            fieldModel.primaryKey = 'PRI_NO_AUTO';
        }

        // 取默认值
        let preposeIndex = arrayUtils.getValueIndex(columns, 'DEFAULT');
        if (preposeIndex > 0) {
            let defaultValue = columns[preposeIndex + 1];
            fieldModel.defaultValue = defaultValue ? defaultValue.replaceAll(`'`, '') : undefined;
        }

        // 取字段说明
        preposeIndex = rowTrim.indexOf('COMMENT');
        if (preposeIndex > 0) {
            let commentText = rowTrim.substring(preposeIndex, rowTrim.length);
            let comment = commentText.replace(`COMMENT `, '');
            comment = comment.replaceAll(`'`, '');
            comment = comment.substring(0, comment.length - 1);
            fieldModel.comment = comment;
        }
        fieldList.push(fieldModel);
    }

    // 设置表的字段列表
    table.fieldList = fieldList;
    return table;
}


/** 根据动态参数，匹配替换器（Replacer）*/ 
const replacerAdapter = {
    /**
     * 原始表名 $table_name$
     * @param {ReplacerRequest} parameter
     * @returns 替换后的代码内容
     */
    table_name: (parameter) => {
        return parameter.content.replaceAll(`$table_name$`, parameter.tableInfo.tableName);
    },

    /**
     * 表名驼峰首字母小写 $table_name_hump$
     * @param {ReplacerRequest} parameter
     * @returns 替换后的代码内容
     */
    table_name_hump: (parameter) => {
        let table_name_hump = letterUtils.underlineToHump(parameter.tableInfo.tableName);
        return parameter.content.replaceAll(`$table_name_hump$`, table_name_hump);
    },

    /**
     * 表名驼峰首字母大写 $table_name_hump_A$
     * @param {ReplacerRequest} parameter
     * @returns 替换后的代码内容
     */
    table_name_hump_A: (parameter) => {
        let table_name_hump = letterUtils.underlineToHump(parameter.tableInfo.tableName)
        let table_name_hump_A = letterUtils.initialsToCapital(table_name_hump);
        return parameter.content.replaceAll(`$table_name_hump_A$`, table_name_hump_A);
    },

    /**
     * 表中文名 $table_desc$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    table_desc: (parameter) => {
        return parameter.content.replaceAll(`$table_desc$`, parameter.tableInfo.tableDesc);
    },

    /**
     * 原始字段名 $field_name$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    field_name: (parameter) => {
        return parameter.content.replaceAll(`$field_name$`, parameter.fieldInfo.field);
    },

    /**
     * 字段名驼峰首字母小写 $field_name_hump$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    field_name_hump: (parameter) => {
        let field_name_hump = letterUtils.underlineToHump(parameter.fieldInfo.field);
        return parameter.content.replaceAll(`$field_name_hump$`, field_name_hump);
    },

    /**
     * 字段名驼峰首字母大写 $field_name_hump_A$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    field_name_hump_A: (parameter) => {
        let field_name_hump = letterUtils.underlineToHump(parameter.fieldInfo.field);
        let field_name_hump_A = letterUtils.initialsToCapital(field_name_hump);
        return parameter.content.replaceAll(`$field_name_hump_A$`, field_name_hump_A);
    },

    /**
     * 字段说明 $field_comment$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    field_comment: (parameter) => {
        let fieldInfo = parameter.fieldInfo;
        return parameter.content.replaceAll(`$field_comment$`, fieldInfo.comment ? fieldInfo.comment : letterUtils.underlineToHump(fieldInfo.field));
    },

    /**
     * 字段数据类型（对应DB）$field_type_db$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    field_type_db: (parameter) => {
        return parameter.content.replaceAll(`$field_type_db$`, parameter.fieldInfo.type);
    },

    /**
     * 字段数据类型（对应Java）$field_type_java$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    field_type_java: (parameter) => {
        return parameter.content.replaceAll(`$field_type_java$`, parameter.fieldInfo.javaType);
    },

    /**
     * 主键字段名 $primary_key$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    primary_key: (parameter) => {
        return parameter.content.replaceAll(`$primary_key$`, getPrimaryKey(parameter.fieldList, '$primary_key$'));
    },

    /**
     * 主键字段名驼峰首字母小写 $primary_key_hump$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    primary_key_hump: (parameter) => {
        let hump = letterUtils.underlineToHump(getPrimaryKey(parameter.fieldList))
        return parameter.content.replaceAll(`$primary_key_hump$`, hump);
    },

    /**
     * 主键字段名驼峰首字母大写 $primary_key_hump_A$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    primary_key_hump_A: (parameter) => {
        let hump = letterUtils.underlineToHump(getPrimaryKey(parameter.fieldList))
        let field_name_hump_A = letterUtils.initialsToCapital(hump);
        return parameter.content.replaceAll(`$primary_key_hump_A$`, field_name_hump_A);
    },

    /**
     * 主键字段数据类型（对应Java）$primary_key_type_java$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    primary_key_type_java: (parameter) => {
        for (let fieldInfo of parameter.fieldList) {
            if (isPrimaryKey(fieldInfo) === true) {
                return parameter.content.replaceAll(`$primary_key_type_java$`, fieldInfo.javaType);
            }
        }
        return parameter.content;
    },

    /**
     * 插入数据sql，字段名列表 $insert_field_name_list$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    insert_field_name_list: (parameter) => {
        return commonLinkField({
            ...parameter,
            dynamicParamCode: 'insert_field_name_list',
            front: '',
            after: ', ',
            wrap: false,
            exclude: ['primaryKey'],
            business: (fieldInfo) => {
                return fieldInfo.field;
            }
        });
    },

    /**
     * 插入数据sql，字段值列表 $insert_field_value_list$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    insert_field_value_list: (parameter) => {
        return commonLinkField({
            ...parameter,
            dynamicParamCode: 'insert_field_value_list',
            front: '',
            after: ', ',
            wrap: false,
            exclude: ['primaryKey'],
            business: (fieldInfo) => {
                return `#{${letterUtils.underlineToHump(fieldInfo.field)}}`;
            }
        });
    },

    /**
     * 修改数据sql，字段名列表 $update_field_list$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    update_field_list: (parameter) => {
        return commonLinkField({
            ...parameter,
            dynamicParamCode: 'update_field_list',
            front: '            ',
            after: ',',
            wrap: true,
            exclude: ['primaryKey'],
            business: (fieldInfo) => {
                return `${fieldInfo.field} = #{${letterUtils.underlineToHump(fieldInfo.field)}}`;
            }
        });
    },

    /**
     * 查询数据sql，字段名列表 $select_field_list$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    select_field_list: (parameter) => {
        return commonLinkField({
            ...parameter,
            dynamicParamCode: 'select_field_list',
            front: '',
            after: ', ',
            wrap: false,
            business: (fieldInfo) => {
                return fieldInfo.field;
            }
        });
    },

    /**
     * whele字段条件sql，字段名列表 $where_field_list$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    where_field_list: (parameter) => {
        return commonLinkField({
            ...parameter,
            dynamicParamCode: 'where_field_list',
            front: '        ',
            after: '',
            wrap: true,
            exclude: [],
            business: (fieldInfo) => {
                let hump = letterUtils.underlineToHump(fieldInfo.field);
                return `<if test="${hump} != null">\n            AND ${fieldInfo.field} = #{${hump}}\n        </if>`;
            }
        });
    },

    /**
     * 创建表-表字段列表 $create_table_field_list$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    create_table_field_list: (parameter) => {
        return commonLinkField({
            ...parameter,
            dynamicParamCode: 'create_table_field_list',
            front: '  ',
            after: ',',
            wrap: true,
            business: (fieldInfo) => {
                let fieldName = '`' + fieldInfo.field + '`';
                let fieldTypeLength = StringUtils.isEmpty(fieldInfo.length) === true ? '' : `(${fieldInfo.length})`;
                let notNull = fieldInfo.isNull === false ? ' NOT NULL' : '';
                let autoIncrement = fieldInfo.primaryKey === 'PRI_AUTO' ? ' AUTO_INCREMENT' : '';
                let defaultAndValue = fieldInfo.defaultValue ? ` DEFAULT '${fieldInfo.defaultValue}'` : '';
                if (fieldInfo.defaultValue === 'NULL' && fieldInfo.isNull === true) {
                    defaultAndValue = ` DEFAULT NULL`;
                }
                let comment = fieldInfo.comment ? ` COMMENT '${fieldInfo.comment}'` : '';
                return `${fieldName} ${fieldInfo.type}${fieldTypeLength}${notNull}${autoIncrement}${defaultAndValue}${comment}`
            }
        });
    },

    /**
     * 数据库引擎 $db_engine$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    db_engine: (parameter) => {
        return parameter.content.replaceAll(`$db_engine$`, parameter.tableInfo.dbEngine);
    },

    /**
     * 数据库编码 $db_encoded$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    db_encoded: (parameter) => {
        return parameter.content.replaceAll(`$db_encoded$`, parameter.tableInfo.encoded);
    },

    /**
     * 当前时间 $current_time$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    current_time: (parameter) => {
        return parameter.content.replaceAll(`$current_time$`, dateUtils.getCurrentTime());
    },

    /**
     * 自动根据数据类型，匹配断言方法 $java_type_adapter_assert_method$
     * @param {ReplacerRequest} parameter 
     * @returns 替换后的代码内容
     */
    java_type_adapter_assert_method: (parameter) => {
        if (parameter.fieldInfo.javaType === 'String') {
            return parameter.content.replaceAll(`$java_type_adapter_assert_method$`, 'isNoBlankStr');
        } else {
            return parameter.content.replaceAll(`$java_type_adapter_assert_method$`, 'isNoEmptyObj');
        }
    },

    /**
     * 动态代码块 - 成员变量列表 $member_param_list$
     * @param {ReplacerRequest} parameter 
     * @returns 替换和拼接后的代码内容
     */
    member_param_list: (parameter) => {
        return memberCodeBlockCore({
            ...parameter,
            dynamicParamCode: 'member_param_list'
        });
    },

    /**
     * 动态代码块 - GetSet方法列表 $get_set_method_list$
     * @param {ReplacerRequest} parameter 
     * @returns 替换和拼接后的代码内容
     */
    get_set_method_list: (parameter) => {
        return memberCodeBlockCore({
            ...parameter,
            dynamicParamCode: 'get_set_method_list'
        });
    },

    /**
     * 动态代码块 - 模型转换器参数列表 $converter_source_to_target_params_list$
     * @param {ReplacerRequest} parameter 
     * @returns 替换和拼接后的代码内容
     */
    converter_source_to_target_params_list: (parameter) => {
        return memberCodeBlockCore({
            ...parameter,
            dynamicParamCode: 'converter_source_to_target_params_list'
        });
    },

    /**
     * 动态代码块 - 必填项业务校验 $biz_check_required_params$
     * @param {ReplacerRequest} parameter 
     * @returns 替换和拼接后的代码内容
     */
    biz_check_required_params: (parameter) => {
        return memberCodeBlockCore({
            ...parameter,
            dynamicParamCode: 'biz_check_required_params',
            custom: (validParams, replacerParameter) => {
                // 只有【必填项】才需要校验，所以要排除非必填项的字段。
                let fieldInfo = replacerParameter.fieldInfo;
                if (isPrimaryKey(fieldInfo) === false && fieldInfo.isNull === false) {
                    return runReplacer(validParams, replacerParameter);
                }
                return '';
            }
        })
    },
}


/**
 * 成员代码块的处理逻辑
 * @param {{
 *  content: 代码内容,
 *  dynamicParamCode: 成员代码块的编码,
 *  codeTemplate: 代码模版对象,
 *  custom : (validParams:string[], replacerParameter: {content, fieldInfo})=>{自定义替换逻辑},
 * }} parameter 
 * @returns 返回拼接完成后的代码内容
 */
const memberCodeBlockCore = (parameter) => {
    if (commonUtils.isEmptyByObj(parameter, ['content', 'dynamicParamCode', 'codeTemplate', 'fieldList']) === true) {
        return;
    }

    let content = parameter.content;
    let dynamicParamCode = parameter.dynamicParamCode;
    let codeTemplate = parameter.codeTemplate;
    let custom = parameter.custom;
    let fieldList = parameter.fieldList;

    // 根据动态参数code，从代码模版-成员代码块列表中，取出对应的成员代码块对象
    let memberCodeInfo = arrayUtils.getKV(codeTemplate.memberCode, 'code', dynamicParamCode);
    if (!memberCodeInfo) return content;

    // 把主体代码内容里，成员代码块编码前面的空格和缩进去掉
    // 例如    $member_param_list$，去掉后会变成$member_param_list$
    // 不然会在这个缩进的基础上，拼接用户自定义的代码，第一行的格式就不整齐了
    let contentSplit = content.split(`$${dynamicParamCode}$`);
    let newContent = '';
    for (let i = 0; i < contentSplit.length; i++) {
        let s = contentSplit[i];
        if (i < contentSplit.length - 1) {
            let front = s.length - 1;
            let after = s.length;
            while (true) {
                let char = s.substring(front, after);
                if (char === ' ' || char === '	') {
                    front--;
                    after--;
                } else {
                    break;
                }
            }
            newContent += s.substring(0, front + 1) + `$${dynamicParamCode}$`;
        } else {
            newContent += s.substring(0, s.length);
        }
    }
    content = newContent;

    // 取成员代码块里面包含的所有动态参数
    let validParams = getTemplateInnerDynamicParams(memberCodeInfo.bodyCode);
    // 成员代码块中，不支持再嵌套成员代码块，所以得做一次剔除
    arrayUtils.removeKV(validParams, 'type', 'code_block');
    // 遍历查找和替换成员代码模版里的动态参数
    let coding = '';
    for (let i = 0; i < fieldList.length; i++) {
        // 执行替换，获得替换后的代码内容
        let replacerParameter = { ...parameter, content: memberCodeInfo.bodyCode, fieldInfo: fieldList[i] };
        let appendCode = custom ? custom(validParams, replacerParameter) : runReplacer(validParams, replacerParameter);
        // 拼接和换行
        coding += appendCode;
        if (appendCode && appendCode.length > 0) coding += '\n';
    }
    return content.replaceAll(`$${dynamicParamCode}$`, coding.substring(0, coding.length - 1));
}

/**
 * 判断是否主键字段
 * @param {FieldInfo} fieldInfo 字段对象
 * @returns true or false
 */
const isPrimaryKey = (fieldInfo) => {
    return fieldInfo.primaryKey === 'PRI_AUTO' || fieldInfo.primaryKey === 'PRI_NO_AUTO';
}

/**
 * 通用的拼接表内所有字段 与 替换对应动态参数
 * @param {{
 *  content: 代码内容,
 *  tableInfo: TableInfo,
 *  fieldList: FieldInfo[],
 *  exclude: 排除的字段数组,
 *  front: 拼接的前缀,
 *  after: 拼接的后缀,
 *  wrap: 是否换行,
 *  dynamicParamCode: 拼接完成后替换的动态参数,
 *  business:()=>{自定义字段对应内容},
 * }} parameter 
 * @returns 
 */
const commonLinkField = (parameter) => {
    let code = '';
    let fieldList = parameter.fieldList;
    let exclude = !parameter.exclude ? [] : parameter.exclude;

    // 把表内所有字段按业务要求连接起来，例如:id,name,price，或者:#{id},#{name},#{price}
    for (let i = 0; i < fieldList.length; i++) {
        let fieldInfo = fieldList[i];
        // 按 exclude 要求排除字段
        if (arrayUtils.contains(exclude, fieldInfo.field) === true
            || (arrayUtils.contains(exclude, 'primaryKey') === true && isPrimaryKey(fieldInfo) === true)) {
            continue;
        }
        // 执行对应业务，获得字段对应内容
        let itemContent = parameter.business(fieldInfo);
        // 非第一行，加上前缀
        if (i > 0 && code.trim().length > 0) itemContent = parameter.front + itemContent;
        // 非最后一行，加上后缀
        if (i < fieldList.length - 1) {
            itemContent += parameter.after;
            // 是否需要换行
            if (parameter.wrap === true) itemContent += '\n';
        }
        code += itemContent;
    }

    // 把连接好的内容，替换对应动态参数
    return parameter.content.replaceAll(`$${parameter.dynamicParamCode}$`, code);
}

/**
 * 获取主键字段名
 * @param {FieldInfo[]} fieldList 字段列表
 * @param {string} defaultValue 没有找到，则返回默认值
 * @returns 
 */
const getPrimaryKey = (fieldList, defaultValue) => {
    for (let fieldInfo of fieldList) {
        if (isPrimaryKey(fieldInfo) === true) {
            return fieldInfo.field;
        }
    }
    return defaultValue;
}


/**
 * 取出模版里面的动态参数
 * @param {string} templateContent 代码模版内容 
 * @returns {DynamicParams[]} []
 */
const getTemplateInnerDynamicParams = (templateContent) => {
    let validParams = [];
    for (let param of DYNAMIC_PARAMS) {
        let index = templateContent.indexOf(`$${param.code}$`);
        if (index > 0) validParams.push(param);
    }
    return validParams;
}

/**
 * 执行替换器
 * @param {string[]} validParams 匹配到的动态参数列表
 * @param {ReplacerRequest} parameter 代码内容 
 * @returns 
 */
const runReplacer = (validParams, parameter) => {
    for (let param of validParams) {
        let replacer = replacerAdapter[param.code];
        if (replacer) {
            parameter.content = replacer(parameter);
        }
    }
    return parameter.content;
}

/**
 * db数据类型转Java数据类型
 * @param {*} dbType 
 * @returns 
 */
const dbTypeToJavaType = (dbType) => {
    for (let classify of MYSQL_DATA_TYPES) {
        for (let typeItem of classify.options) {
            if (dbType === typeItem.value) return typeItem.javaType;
        }
    }
    return undefined;
}

