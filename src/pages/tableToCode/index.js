
import { Component } from 'react';
import { Typography, Input, Divider, Button, Tabs, Popconfirm, message } from 'antd';
import { ExportOutlined, ImportOutlined, SettingOutlined, CodeOutlined } from '@ant-design/icons';
import Css from '../../css/Css';
import arrayUtils from '../../utils/arrayUtils';
import stringUtils from '../../utils/stringUtils';
import localUtils from '../../utils/localUtils';
import request from '../../utils/request';
import HistoryModal from '../../components/historyModal';
import { icon, file } from '../../configs/resource';
import { matchAndReplace, distinguishCreateTableSql } from './core';
import EditTable from './components/EditTable';
import GenerateCodeList from './components/GenerateCodeList';
import TemplateModal from './components/TemplateModal';
import { CODE_TEMPLATE_CONFIG_KEY } from '../../constants/tableToCode';
import { refresh, containerHeight, refreshByKey, spaceH } from '../../utils'

const { TextArea } = Input;
const { Text } = Typography;

/** DB表生成业务代码 */
export default class TableToCodeUtils extends Component {

    // 表信息
    tableInfo = undefined;

    /** 代码模版列表 extends TemplateClassify */
    codeTemplates = []
    /** 编辑中的模版 */
    templateEditingData = undefined;
    /** 编辑中的模版(用来直接操作的对象，避免未点保存，就修改了真正的数据) */
    _templateEditingData = undefined;

    /** 当前Tabs组件展示的内容key */
    tabsActiveKey = 'custom';

    /**
     * 在渲染前调用
     * */
    componentWillMount() {
        // 取代码模版本地缓存
        let codeTemplatesJson = localStorage.getItem(CODE_TEMPLATE_CONFIG_KEY);
        if (codeTemplatesJson && codeTemplatesJson.trim().length > 0) {
            this.codeTemplates = JSON.parse(codeTemplatesJson);
        }

        // 判断是否需要拉取默认模版
        if (!this.codeTemplates || this.codeTemplates.length === 0) {
            request.get(file.base_code_template_config).then((data) => {
                this.codeTemplates = data;
                localStorage.setItem(CODE_TEMPLATE_CONFIG_KEY, JSON.stringify(this.codeTemplates));
            }).catch(() => {
                message.warning('拉取默认模版配置失败，请稍后刷新重试或者自行配置模版');
            });
        }
    }

    render() {

        return (
            <div style={{ minHeight: containerHeight(), background: '#fff', display: 'flex', position: 'relative', flexDirection: 'column', paddingLeft: '10%', paddingRight: '10%' }}>
                <Tabs
                    tabBarGutter={30}
                    defaultActiveKey='custom'
                    activeKey={this.tabsActiveKey}
                    style={{ border: '1px solid #e1e1e8', borderRadius: 5, marginTop: 58 }}
                    tabBarExtraContent={
                        <Button
                            type='text'
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 5 }}
                            icon={<img style={{ width: 25, height: 25 }} src={icon.history} />}
                            onClick={() => refreshByKey(this, 'historyModalShow', true)}
                        />
                    }
                    onChange={(k) => refreshByKey(this, 'tabsActiveKey', k)}
                >
                    <Tabs.TabPane tab='' key="spaceTab" />
                    <Tabs.TabPane tab='表信息' key="custom" style={{ padding: 15 }} >
                        <EditTable
                            tableInfo={this.tableInfo}
                            onEditChange={(v) => {
                                this.tableInfo = v;
                                refresh(this);
                            }}
                        />
                    </Tabs.TabPane>

                    <Tabs.TabPane tab='识别MySQL建表代码' key="create_table_code" style={{ marginTop: -15, padding: 5 }}>
                        <div style={{ background: '#ffffff', position: 'relative' }}>
                            <TextArea spellCheck={false} autoSize={{ minRows: 11, maxRows: 15 }} onChange={(e) => {
                                this.createTableSql = e.currentTarget.value;
                            }} />
                            <Button
                                style={{ top: 10, right: 10, position: 'absolute' }}
                                type='primary'
                                onClick={() => {
                                    this.distinguishCreateTableSql(this.createTableSql)
                                }}>
                                识别
                            </Button>
                        </div>
                    </Tabs.TabPane>
                </Tabs>

                {/* 生成代码 */}
                {spaceH(60)}
                {this.generateCodeOperatorRow()}
                <Divider marginTop={0} />
                <GenerateCodeList
                    tableInfo={this.tableInfo}
                    codeTemplates={this.codeTemplates}
                    generated={this.generateCodeFinish}
                />

                {spaceH(60)}
                {/* 历史记录弹窗 */}
                {this.historyModal()}

                {/* 代码模版配置弹窗 */}
                <TemplateModal
                    visible={this.templateModalShow}
                    codeTemplates={this.codeTemplates}
                    onCancel={() => refreshByKey(this, 'templateModalShow', false)}
                    onChange={(codeTemplates) => {
                        this.codeTemplates = codeTemplates;
                        refresh(this);
                        console.log('aaa', this.codeTemplates)
                    }}
                />
            </div >
        )
    }


    /**
     * 历史记录弹窗
     * @returns <HistoryModal>
     */
    historyModal = () => {
        return (
            <HistoryModal
                indexKey='table_to_code_utils'
                visible={this.historyModalShow}
                customRowContent={(row) => {
                    return (
                        <div style={{ ...Css.transverse }}>
                            <Text style={{ width: 300, fontSize: 15 }} ellipsis={true} >
                                表名：{row.tableName}{row.tableDesc ? '(' + row.tableDesc + ')' : ''}
                            </Text>

                            <Divider type='vertical' />
                            <Text style={{ width: 500, fontSize: 15 }} ellipsis={true} >
                                字段：{row.fieldList ? JSON.stringify(arrayUtils.getAppointKeyAllValue(row.fieldList, 'field')) : '[]'}
                            </Text>
                        </div>
                    )
                }}
                onLoaded={(instance) => {
                    this.historyInstance = instance;
                }}
                onSelected={(row) => {
                    this.tableInfo = { ...row };
                    this.tableInfo.fieldList = row.fieldList ? row.fieldList : [];
                    this.editingField = undefined;
                    refresh(this);
                }}
                onCancel={() => refreshByKey(this, 'historyModalShow', false)}
            />
        )
    }

    /** 添加历史记录 */
    addHistory = () => {
        let table = { ...this.tableInfo };
        if (this.historyInstance) this.historyInstance.addHistory(table);
    }

    /**
     * 生成代码操作按钮
     * @returns 
     */
    generateCodeOperatorRow = () => {
        return (
            < div style={{ ...Css.transverse }}>
                <span style={{ fontSize: 25, color: '#595959', fontWeight: 'bold' }}>
                    生成代码
                </span>
                <div style={{ flex: 1 }} />

                {/* 导入、导出模版按钮、代码模版设置、一键生成代码 按钮 */}
                <Popconfirm
                    okText="确认"
                    cancelText="取消"
                    title={'导入后会覆盖当前的模版配置，确定要进行导入的操作吗？'}
                    onConfirm={this.importTemplate} >
                    <Button type='file' style={{ marginLeft: 15 }} icon={<ExportOutlined />} >导入模版</Button>
                </Popconfirm>

                <Popconfirm
                    okText="确认"
                    cancelText="取消"
                    title={
                        <div style={{ ...Css.transverseC, width: 350 }}>
                            <span style={{ width: 80 }}>文件名：</span>
                            <Input defaultValue={this.tepmlateConfigFielName} onChange={(e) => {
                                this.tepmlateConfigFielName = e.currentTarget.value;
                            }} />
                        </div>
                    }
                    onConfirm={() => {
                        localUtils.saveJson(this.codeTemplates, this.tepmlateConfigFielName);
                    }} >
                    <Button style={{ marginLeft: 15 }} icon={<ImportOutlined />} >导出模版</Button>
                </Popconfirm>

                <Button
                    style={{ marginLeft: 15 }}
                    icon={<SettingOutlined />}
                    onClick={() => { refreshByKey(this, 'templateModalShow', true); }}>
                    代码模版设置
                </Button>

                <Button
                    type='primary'
                    style={{ marginLeft: 15 }}
                    icon={<CodeOutlined />}
                    onClick={this.generateCode}>
                    一键生成代码
                </Button>
            </div >
        )
    }


    /**
     * 生成代码
     */
    generateCode = () => {
        // 必填项的非空校验
        if (!this.tableInfo || stringUtils.isEmptyByObj(this.tableInfo, ['tableName', 'tableDesc', 'dbEngine', 'encoded']) === true) {
            message.warning('表名、表中文名、表引擎、表编码方式均不可空');
            return;
        }

        // 遍历代码模版，执行匹配-替换逻辑
        for (let classify of this.codeTemplates) {
            for (let template of classify.templates) {
                let parameter = { codeTemplate: template, tableInfo: this.tableInfo };
                template.generateCode = matchAndReplace(parameter);
            }
        }

        // 完成，刷新
        refreshByKey(this, 'generateCodeFinish', true);
        // 添加历史记录
        this.addHistory();
    }


    /**
     * 识别建表SQL
     */
    distinguishCreateTableSql = (sql) => {
        // 设置识别到的表基本信息
        this.tableInfo = distinguishCreateTableSql(sql)
        // 切换tab页卡
        this.tabsActiveKey = 'custom';
        // 设置当前编辑中的字段等于空
        this.editingField = undefined;
        // 添加历史记录
        this.addHistory();
        refresh(this);
    }
}
