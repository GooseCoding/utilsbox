

/** 动态参数定义 */
export const DYNAMIC_PARAMS = [
    // 动态参数
    // 表基本信息
    { code: 'table_name', desc: '表名' },
    { code: 'table_name_hump', desc: '表名驼峰首字母小写' },
    { code: 'table_name_hump_A', desc: '表名驼峰首字母大写' },
    { code: 'table_desc', desc: '表中文名' },
    { code: 'db_engine', desc: '数据库引擎' },
    { code: 'db_encoded', desc: '数据库编码' },
    // 字段信息
    { code: 'field_name', desc: '字段名' },
    { code: 'field_name_hump', desc: '字段名驼峰首字母小写' },
    { code: 'field_name_hump_A', desc: '字段名驼峰首字母大写' },
    { code: 'field_comment', desc: '字段说明' },
    { code: 'field_type_db', desc: '字段数据类型（对应DB）' },
    { code: 'field_type_java', desc: '字段数据类型（对应Java）' },
    // 主键信息
    { code: 'primary_key', desc: '主键字段' },
    { code: 'primary_key_hump', desc: '主键字段驼峰首字母小写' },
    { code: 'primary_key_hump_A', desc: '主键字段驼峰首字母大写' },
    { code: 'primary_key_type_java', desc: '主键字段Java数据类型' },
    // sql相关
    { code: 'insert_field_name_list', desc: '插入字段名称列表' },
    { code: 'insert_field_value_list', desc: '插入字段值列表' },
    { code: 'update_field_list', desc: '修改字段列表' },
    { code: 'select_field_list', desc: '查询字段列表' },
    { code: 'where_field_list', desc: 'where字段条件列表' },
    { code: 'create_table_field_list', desc: '创建表-表字段列表' },
    // 其他
    { code: 'current_time', desc: '当前时间 yyyy-MM-DD hh:mm:ss' },
    { code: 'java_type_adapter_assert_method', desc: 'Java数据类型适配断言方法' },


    // 可用户自定义的动态代码块
    { code: 'member_param_list', desc: '成员变量列表', type: 'code_block' },
    { code: 'get_set_method_list', desc: 'GetSet方法列表', type: 'code_block' },
    { code: 'converter_source_to_target_params_list', desc: '模型转换器参数列表', type: 'code_block' },
    { code: 'biz_check_required_params', desc: '必填项业务校验', type: 'code_block' },
]

/** MySQL数据类型 */
export const MYSQL_DATA_TYPES = [
    {
        label: '数值类型',
        code: 'number',
        options: [
            { label: 'TINYINT', value: 'TINYINT', length: 3, javaType: 'Integer' },
            { label: 'SMALLINT', value: 'SMALLINT', length: 5, javaType: 'Integer' },
            { label: 'MEDIUMINT', value: 'MEDIUMINT', length: 8, javaType: 'Integer' },
            { label: 'INT', value: 'INT', length: 11, javaType: 'Integer' },
            { label: 'BIGINT', value: 'BIGINT', length: 20, javaType: 'Long' },
            { label: 'FLOAT', value: 'FLOAT', javaType: 'Float' },
            { label: 'DOUBLE', value: 'DOUBLE', javaType: 'Double' },
            { label: 'DECIMAL', value: 'DECIMAL', length: '10,0', javaType: 'String' },
        ],
    },
    {
        label: '字符串类型',
        code: 'string',
        options: [
            { label: 'CHAR', value: 'CHAR', length: 1, javaType: 'String' },
            { label: 'VARCHAR', value: 'VARCHAR', length: 32, javaType: 'String' },
            { label: 'TINYBLOB', value: 'TINYBLOB', javaType: 'String' },
            { label: 'TINYTEXT', value: 'TINYTEXT' },
            { label: 'BLOB', value: 'BLOB', javaType: 'String' },
            { label: 'TEXT', value: 'TEXT', javaType: 'String' },
            { label: 'MEDIUMBLOB', value: 'MEDIUMBLOB', javaType: 'String' },
            { label: 'MEDIUMTEXT', value: 'MEDIUMTEXT', javaType: 'String' },
            { label: 'LONGBLOB', value: 'LONGBLOB', javaType: 'String' },
            { label: 'LONGTEXT', value: 'LONGTEXT', javaType: 'String' },
        ],
    },
    {
        label: '日期和时间类型',
        code: 'date',
        options: [
            { label: 'DATE', value: 'DATE', javaType: 'Date' },
            { label: 'TIME', value: 'TIME', javaType: 'Date' },
            { label: 'YEAR', value: 'YEAR', length: 4, javaType: 'String' },
            { label: 'DATETIME', value: 'DATETIME', javaType: 'Date' },
            { label: 'TIMESTAMP', value: 'TIMESTAMP', javaType: 'Date' },
        ],
    },
]

/** 字段状态 */
export const FIELD_STATUS = {
    /** 草稿 */
    draft: 'draft',
    /** 完成 */
    finish: 'finish'
}

/** 存储到本地localSto */
export const CODE_TEMPLATE_CONFIG_KEY = 'utilsbox.cn_code_template_config';