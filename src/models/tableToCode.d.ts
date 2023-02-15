
/** 表信息 */
interface TableInfo {
    /** 表名 */
    tableName: string;
    /** 表中文名 */
    tableDesc: string;
    /** 表引擎 */
    dbEngine: string;
    /** 表编码方式 */
    encoded: string;
    /**  字段列表 */
    fieldList: FieldInfo[]
}

/** 字段信息 */
interface FieldInfo {
    /** 字段名 */
    field: string;
    /** 字段类型 */
    type: string;
    /** 主键类型（自增，非自增） */
    primaryKey: string;
    /** 字段长度 */
    length: number;
    /** 是否可NULL */
    isNull: boolean;
    /** 默认值 */
    defaultValue: string;
    /** 对应的Java类型 */
    javaType: string;
}


/** 模版分类信息 */
interface TemplateClassify {
    /** 分类/层级编码 */
    classify: string;
    /** 分类标题 */
    title: string;
    /** 分类下的代码模版列表 */
    templates: CodeTemplate[]
}

/** 模版内容信息 */
interface CodeTemplate {
    /** 代码模版编码 */
    code: string;
    /** 代码模版名称 */
    title: string;
    /** 代码内容 */
    bodyCode: string;
    /** 成员代码块列表 */
    memberCode: MemberCodeBlock[];
}

/** 成员代码模版 */
interface MemberCodeBlock {
    /** 成员代码模版编码（对应一个动态参数） */
    code: string;
    /** 成员代码模版名称 */
    title: string;
    /** 代码内容 */
    bodyCode: string
}

/** 替换器入参定义 */ 
interface ReplacerRequest {
    /** 代码内容 必填 */
    content: string;
    /** 表信息 必填 */
    tableInfo: TableInfo;
    /** 字段列表 必填 (这个字段其实tableInfo里面的，把它拎出来，是为了使用的时候方便，不用每次都 parameter.tableInfo.fieldList) */
    fieldList: FieldInfo[];
    /** 单个字段信息对象 非必填，在执行字段相关的替换器时必填 */
    fieldInfo: FieldInfo
}


/** 动态参数信息 */ 
interface DynamicParams {
    /** 动态参数编码 */
    code: string;
    /** 动态参数名称/说明 */
    desc: string;
    /** 动态参数类型，默认是基本动态参数，code_block（动态代码块） */
    type: string
}


interface EditTableProps {
    /** 表信息 */
    tableInfo: TableInfo;
    /** 编辑时触发 */
    onEditChange: (value: TableInfo) => void;
    /** 加载完成触发 */
    onLoaded: (instance: EditTableInstance) => void;
}

interface EditTableInstance {
    refreshTableInfo: (tableInfo: TableInfo) => void;
}

interface GenerateCodeProps {
    /** 表信息 */
    tableInfo: TableInfo;
    /** 模版配置列表 */
    codeTemplates: CodeTemplate[];
    /** 代码是否生成完成 */
    generated: boolean;
}


interface TemplateModalProps {
    /** 是否显示弹窗 */
    visible: boolean;
    /** 模版配置列表 */
    codeTemplates: CodeTemplate[];
    /** 代码模版有改变时触发 */
    onChange:(codeTemplates: CodeTemplate[]) => void;
    /** 关闭Modal时触发 */
    onCancel:() => void;
}