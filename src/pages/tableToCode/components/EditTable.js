
import { Component } from 'react';
import { Input, Divider, Button, Select, Checkbox, message } from 'antd';
import { spaceW, refresh } from '../../../utils';
import Css from "../../../css/Css";
import { MYSQL_DATA_TYPES, FIELD_STATUS } from '../../../constants/tableToCode';
import stringUtils from "../../../utils/stringUtils";
import arrayUtils from "../../../utils/arrayUtils";


/** 字段的宽度 */
const columnWidth = {
    field: { flex: 1 },
    type: { flex: 1 },
    length: { flex: 1 },
    isNull: { width: 80 },
    primaryKey: { flex: 1 },
    defaultValue: { width: 200 },
    comment: { width: 230 },
    action: { width: 150 },
}

/**
 * 编辑表和字段信息组件
 * @param {EditTableProps} props
 */
export default class EditTable extends Component {

    /** 表基本信息 extends TableInfo */
    tableInfo = {
        tableName: undefined,
        tableDesc: undefined,
        dbEngine: 'InnoDB',
        encoded: 'utf8',
        fieldList: [{
            field: "id",
            type: 'BIGINT',
            primaryKey: 'PRI_AUTO',
            length: 20,
            isNull: false,
            defaultValue: undefined,
            javaType: 'Long',
            /** 是否编辑中 */
            editing: true,
            /** 字段状态 */
            fieldStatus: FIELD_STATUS.draft,
        }]
    }
    /** 编辑中的字段 */
    editingField = undefined;

    /**
     * 在渲染前调用
     * */
    componentWillMount() {
        this.editingField = this.tableInfo.fieldList[0];
        // if(this.props.onLoaded) this.props.onLoaded(this);
    }

    render() {

        this.tableInfo = this.props.tableInfo ? this.props.tableInfo : this.tableInfo;
        this.onEditChange = this.props.onEditChange;

        return (
            <div>
                {/* 表信息 */}
                <div style={{ ...Css.transverse, justifyContent: 'flex-start' }}>
                    <span >数据表名：</span>
                    <Input style={{ width: 230 }} value={this.tableInfo.tableName} onChange={e => this.inputBinding(this.tableInfo, 'tableName', e, true)} />

                    {spaceW(50)}
                    <span >中文表名：</span>
                    <Input style={{ width: 230 }} value={this.tableInfo.tableDesc} onChange={e => this.inputBinding(this.tableInfo, 'tableDesc', e, true)} />

                    {spaceW(50)}
                    <span >数据库引擎：</span>
                    <Input value={this.tableInfo.dbEngine} style={{ width: 150 }} onChange={e => this.inputBinding(this.tableInfo, 'dbEngine', e, true)} />

                    {spaceW(50)}
                    <span >编码：</span>
                    <Input value={this.tableInfo.encoded} style={{ width: 150 }} onChange={e => this.inputBinding(this.tableInfo, 'encoded', e, true)} />
                </div>
                <Divider style={{ margin: 0, marginTop: 30 }} />

                {/* 字段标题 */}
                <div style={{ ...Css.transverse, height: 50, padding: 10, background: '#fafafa' }}>
                    <span style={{ ...columnWidth.field }}>字段(Field)</span>
                    <Divider type='vertical' />
                    <span style={{ ...columnWidth.type }}>类型(Type)</span>
                    <Divider type='vertical' />
                    <span style={{ ...columnWidth.length }}>长度(Length)</span>
                    <Divider type='vertical' />
                    <span style={{ ...columnWidth.isNull }}>允许NULL?</span>
                    <Divider type='vertical' />
                    <span style={{ ...columnWidth.primaryKey }}>是否主键</span>
                    <Divider type='vertical' />
                    <span style={{ ...columnWidth.defaultValue }}>默认值</span>
                    <Divider type='vertical' />
                    <span style={{ ...columnWidth.comment }}>字段说明</span>
                    <Divider type='vertical' />
                    <span style={{ textAlign: 'center', ...columnWidth.action }}>操作</span>
                </div>
                <Divider style={{ margin: 0 }} />

                {/* 字段列表 */}
                <div style={{ ...Css.vertical }} >
                    {this.fieldListView()}
                </div>

                {/* 添加字段 */}
                <Button block style={{ marginTop: 30, height: 35 }} onClick={this.addField}>添加字段</Button>
            </div>
        )
    }

    /**
     * 刷新页面
     * @param {TableInfo} tableInfo 
     */
    refreshTableInfo = (tableInfo) => {
        this.tableInfo = tableInfo;
        refresh(this);
    }

    /** input输入框绑定 */
    inputBinding = (obj, key, e, isRefresh) => {
        obj[key] = e.currentTarget.value;
        if (isRefresh === true) refresh(this);
        if (this.props.onEditChange) this.props.onEditChange(this.tableInfo);
    }

    /** 是否有编辑中的字段未被确认 */
    isEditingField = () => {
        for (let fieldInfo of this.tableInfo.fieldList) {
            if (fieldInfo.editing === true) {
                message.warning('有编辑中的字段未被确认', 3);
                return false;
            }
        }
    }

    /** 添加字段 */
    addField = () => {
        if (!this.tableInfo) return;
        if (this.isEditingField() === false) return;
        this.editingField = { editing: true, fieldStatus: FIELD_STATUS.draft, isNull: false, };
        this.tableInfo.fieldList.push(this.editingField);
        refresh(this);
    }

    /**
     * 动态生成字段列表
     * @returns 
     */
    fieldListView = () => {
        let result = [];
        let background = '#ffffff';
        for (let item of this.tableInfo.fieldList) {
            result.push(this.fieldRowView(item, background));
            background = background === '#fafafa' ? '#ffffff' : '#fafafa';
        }
        result.push(<Divider style={{ margin: 0 }} />);
        return result;
    }

    /**
     * 字段属性行生成
     * @param {*} item 
     * @returns 
     */
    fieldRowView = (item, background) => {

        // 编辑按钮点击事件
        let editClick = () => {
            if (this.isEditingField() === false) return;

            item.editing = true;
            this.editingField = { ...item };
            refresh(this);
        }

        // 编辑完成按钮点击事件
        let confirmClick = () => {
            if (stringUtils.isNotBlack(this.editingField.field) === false) {
                message.warning('请填写字段名', 3);
                return;
            }

            if (stringUtils.isNotBlack(this.editingField.type) === false) {
                message.warning('请填写数据类型', 3);
                return;
            }

            for (let key in this.editingField) {
                item[key] = this.editingField[key];
            }
            item.editing = false;
            item.fieldStatus = FIELD_STATUS.finish;
            this.editingField = undefined;
            if (this.props.onEditChange) this.props.onEditChange(this.tableInfo);
            refresh(this);
        }

        // 删除或取消编辑按钮点击事件
        let deleteOrCancelClick = () => {
            if (this.editingField.fieldStatus === FIELD_STATUS.draft) {
                arrayUtils.removeKV(this.tableInfo.fieldList, 'field', this.editingField.field);
            } else {
                item.editing = false;
            }
            this.editingField = undefined;
            refresh(this);
        }

        // 列
        let column = (content, width, isDivider) => {
            return [
                <div style={{ ...width, ...Css.transverse }}>
                    {content}
                </div>,
                isDivider === true ? <Divider type='vertical' /> : []
            ]
        }

        // 行数据变动
        let itemChange = (k, v) => {
            this.editingField[k] = v;
        }

        // 通用的输入框
        let commonInput = (columnKey, onChange) => {
            return <Input value={this.editingField[columnKey]} onChange={(e) => {
                itemChange(columnKey, e.currentTarget.value);
                if (onChange) onChange();
                refresh(this);
            }} />
        }

        // 编辑中显示的行信息
        let editingRow = () => {
            return (
                <div style={{ ...Css.transverse, background: background, padding: 10 }}>
                    {/* 字段名称 */}
                    {column(commonInput('field'), columnWidth.field, true)}
                    {/* 字段数据类型 */}
                    {column(
                        <Select
                            defaultValue={this.editingField.type}
                            style={{ width: '100%' }}
                            onChange={(v, o) => {
                                itemChange('type', v)
                                itemChange('length', o.length);
                                itemChange('javaType', o.javaType);
                                refresh(this);
                            }}
                            options={MYSQL_DATA_TYPES}
                        />, columnWidth.type, true
                    )}
                    {/* 字段长度 */}
                    {column(commonInput('length'), columnWidth.length, true)}
                    {/* 字段是否可NULL */}
                    {column(
                        <div style={{ ...Css.transverseC, width: '100%' }}>
                            <Checkbox checked={this.editingField.isNull} onChange={(e) => {
                                let primaryKey = this.editingField.primaryKey;
                                let checked = e.target.checked;
                                if (primaryKey === 'PRI_AUTO' || primaryKey === 'PRI_NO_AUTO') {
                                    if (checked === true) {
                                        message.warning('主键不可等于NULL');
                                        return;
                                    }
                                }

                                itemChange('isNull', checked);
                                refresh(this);
                            }} />
                        </div>, columnWidth.isNull, true
                    )}
                    {/* 字段主键 */}
                    {column(
                        <Select
                            onChange={(v) => {
                                let primaryKey = v;
                                if (v == 'PRI_AUTO' || v === 'PRI_NO_AUTO') {
                                    for (let field of this.tableInfo.fieldList) {
                                        if (field.field !== this.editingField.field && (field.primaryKey === 'PRI_AUTO' || field.primaryKey === 'PRI_NO_AUTO')) {
                                            message.warning('已经存在主键', 3);
                                            primaryKey = 'None';
                                        }
                                    }

                                    if (primaryKey) itemChange('isNull', false);
                                    if (primaryKey) itemChange('defaultValue', undefined);
                                }

                                itemChange('primaryKey', primaryKey);
                                refresh(this);
                            }}
                            value={this.editingField.primaryKey}
                            style={{ width: '100%' }}
                            options={[
                                {
                                    value: 'None',
                                    label: '否',
                                },
                                {
                                    value: 'PRI_AUTO',
                                    label: '自增主键',
                                },
                                {
                                    value: 'PRI_NO_AUTO',
                                    label: '非自增主键',
                                }
                            ]}
                        />, columnWidth.primaryKey, true
                    )}
                    {/* 字段默认值 */}
                    {column(commonInput('defaultValue', () => {
                        if (this.editingField.primaryKey == 'PRI_AUTO' || this.editingField.primaryKey === 'PRI_NO_AUTO') {
                            itemChange('defaultValue', '');
                        }
                    }), columnWidth.defaultValue, true)}
                    {/* 字段说明 */}
                    {column(commonInput('comment'), columnWidth.comment, true)}
                    {/* 操作 */}
                    <div style={{ ...columnWidth.action, ...Css.transverseC }}>
                        <Button type="text" danger onClick={deleteOrCancelClick}>
                            {this.editingField.fieldStatus === FIELD_STATUS.draft ? '删除' : '取消'}
                        </Button>
                        <Button style={{ color: '#1890ff' }} type="text" onClick={confirmClick} > 确认 </Button>
                    </div>
                </div>
            )
        }

        // 编辑完成显示的行信息
        let editFinishRow = () => {
            let primaryKeyAdapter = { None: 'None', PRI_AUTO: '自增主键', PRI_NO_AUTO: '非自增主键' }
            return (
                <div style={{ ...Css.transverse, background: background, padding: 10 }}>
                    {/* 字段名 */}
                    {column(<span>{item.field}</span>, columnWidth.field, true)}
                    {/* 字段类型 */}
                    {column(<span>{item.type}</span>, columnWidth.type, true)}
                    {/* 字段长度 */}
                    {column(<span>{item.length}</span>, columnWidth.length, true)}
                    {/* 字段是否可空 */}
                    {column(
                        <div style={{ ...Css.transverseC, width: '100%' }}>
                            <Checkbox checked={item.isNull} disabled />
                        </div>, columnWidth.isNull, true
                    )}
                    {/* 字段是否主键 */}
                    {column(<span>{primaryKeyAdapter[item.primaryKey]}</span>, columnWidth.primaryKey, true)}
                    {/* 字段默认值 */}
                    {column(<span>{item.defaultValue}</span>, columnWidth.defaultValue, true)}
                    {/* 字段说明 */}
                    {column(<span>{item.comment}</span>, columnWidth.comment, true)}
                    {/* 操作 */}
                    <div style={{ ...Css.transverseC, ...columnWidth.action }}>
                        <Button type="text" danger onClick={() => {
                            arrayUtils.removeKV(this.tableInfo.fieldList, 'field', item.field);
                            refresh(this);
                        }}> 删除 </Button>
                        <Button style={{ color: '#1890ff' }} type="text" onClick={editClick} > 编辑 </Button>
                    </div>
                </div>
            )
        }

        if (item.editing === true) {
            return editingRow();
        } else {
            return editFinishRow();
        }
    }
}
