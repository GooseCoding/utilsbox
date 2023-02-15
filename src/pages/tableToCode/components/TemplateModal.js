
import { Component } from 'react';
import { Input,  Dropdown, Button, Modal, List, Popconfirm, Menu, Checkbox, message } from 'antd';
import { DeleteOutlined, PlusOutlined, FormOutlined } from '@ant-design/icons';
import Css from '../../../css/Css';
import { CODE_TEMPLATE_CONFIG_KEY, DYNAMIC_PARAMS } from '../../../constants/tableToCode'
import { objectCopy, refresh, refreshByKey, spaceH } from '../../../utils';
import stringUtils from '../../../utils/stringUtils';
import arrayUtils from '../../../utils/arrayUtils';

const { TextArea } = Input;

/**
 * 模版配置Modal组件
 * @param {TemplateModalProps} props
 */
export default class TemplateModal extends Component {

    /** 代码模版列表 extends CodeTemplate */
    codeTemplates = undefined;

    /** 编辑中的模版 */
    templateEditingData = undefined;
    /** 编辑中的模版(用来直接操作的对象，避免未点保存，就修改了真正的数据) */
    _templateEditingData = undefined;

    /** 选中的分类对象 */
    selectedClassify = undefined;
    /** 选中的代码模版对象 */
    selectedCodeTemplate = undefined;

    /** 添加进行中的代码模版对象 */
    addingCodeTemplate = undefined;
    /** 添加进行中的分类对象 */
    addingClassify = undefined;


    /**
     * 在渲染前调用
     * */
    componentWillMount() {
    }

    render() {

        this.codeTemplates = this.props.codeTemplates ? this.props.codeTemplates : {};

        return (
            <div style={{ ...Css.vertical }}>
                {this.templateModal()}
            </div>
        )
    }

    /**
     * 代码模版弹窗
     */
    templateModalShow = false;
    templateModal = () => {
        let templateViews = [];
        let createLayerView = (layer) => (
            <div style={{ ...Css.vertical, marginBottom: 15 }}>
                {/* 层级信息行 */}
                <div style={{ ...Css.transverse, background: '#f5f5f5', padding: 15, borderRadius: 6 }}>
                    {/* 层级名称 */}
                    <span style={{ fontSize: 19, color: '#595959', fontWeight: 'bold' }}>
                        {layer.title}
                    </span>

                    {/* 按钮部分，删除、新增 */}
                    <div style={{ flex: 1 }} />
                    <Popconfirm
                        title="确认删除这个分类吗？（如果只是想不生成该层级模版代码，取消勾选即可）"
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => {
                            arrayUtils.removeKV(this.codeTemplates, 'classify', layer.classify);
                            localStorage.setItem(CODE_TEMPLATE_CONFIG_KEY, JSON.stringify(this.codeTemplates));
                            if(this.props.onChange) this.props.onChange(this.codeTemplates);
                            refresh(this);
                        }}
                    >
                        <Button style={{ margin: 0 }} type='link' danger icon={<DeleteOutlined />} >删除</Button>
                    </Popconfirm>
                    <Button style={{ margin: 0, padding: 0 }} type='link' icon={<PlusOutlined />} onClick={() => {
                        this.selectedClassify = layer;
                        this.addingCodeTemplate = {};
                        refreshByKey(this, 'addTemplateModalShow', true);
                    }} >新增模版</Button>
                </div>

                {/* 模版列表 */}
                <List
                    bordered={false}
                    dataSource={layer.templates}
                    renderItem={item => (
                        <List.Item >
                            <div style={{ ...Css.transverse, width: '100%', paddingLeft: 15, paddingRight: 15 }}>
                                {/* 模版名称和选择部分 */}
                                <Checkbox checked={item.selectIon} onChange={(e) => {
                                    item.selectIon = e.target.checked;
                                    localStorage.setItem(CODE_TEMPLATE_CONFIG_KEY, JSON.stringify(this.codeTemplates));
                                    if(this.props.onChange) this.props.onChange(this.codeTemplates);
                                    refresh(this);
                                }}>
                                    {item.title}
                                </Checkbox>

                                {/* 按钮部分，删除、编辑 */}
                                <div style={{ flex: 1 }} />
                                <Popconfirm
                                    title="确认删除模版吗？（如果只是想不生成该模版代码，取消勾选即可）"
                                    okText="确认"
                                    cancelText="取消"
                                    onConfirm={() => {
                                        arrayUtils.removeKV(layer.templates, 'code', item.code);
                                        localStorage.setItem(CODE_TEMPLATE_CONFIG_KEY, JSON.stringify(this.codeTemplates));
                                        if(this.props.onChange) this.props.onChange(this.codeTemplates);
                                        refresh(this);
                                    }}
                                >
                                    <Button type='link' danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                                <Button type='link' icon={<FormOutlined />} onClick={() => {
                                    this.templateEditingData = item;
                                    this._templateEditingData = { ...item };
                                    this.templateEditModalShow = true;
                                    refresh(this);
                                }} />
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        )

        // 根据模版数据列表，生成展示信息
        for (let layer of this.codeTemplates) {
            let layerView = createLayerView(layer);
            templateViews.push(layerView);
        }

        return (
            <Modal
                key='templateModal'
                title="模版配置"
                width={1000}
                height={500}
                visible={this.props.visible}
                closable
                footer={null}
                onCancel={() => { if (this.props.onCancel) this.props.onCancel(); }}>
                <Button
                    style={{ fontWeight: 'bold', padding: 0, margin: 0, fontSize: 17, marginBottom: 15 }}
                    type='link'
                    icon={<PlusOutlined />}
                    onClick={() => {
                        this.addingClassify = {};
                        refreshByKey(this, 'addClassifyModalShow', true);
                    }}>
                    新增分类
                </Button>

                <div style={{ height: 600, overflowY: 'scroll' }}>
                    {templateViews}
                </div>

                {/* 编辑模版弹窗 */}
                {this.templateEditModal()}
                {/* 添加模版的弹窗 */}
                {this.addTemplateModal()}
                {/* 添加分类的弹窗 */}
                {this.addClassifyModal()}
            </Modal>
        )
    }

    /**
     * 添加分类弹窗
     */
    addClassifyModalShow = false;
    addClassifyModal = () => {
        return (
            <Modal
                key='addClassifyModal'
                title={'添加层级'}
                width={500}
                visible={this.addClassifyModalShow}
                closable
                okText={'确定'}
                cancelText={'取消'}
                onOk={() => {
                    if (arrayUtils.getKV(this.codeTemplates, 'classify', this.addingClassify.classify)) {
                        message.warning('此编码已存在');
                        return;
                    }

                    if (stringUtils.isEmptyByObj(this.addingClassify, ['classify', 'title']) === true) {
                        message.warning('编码和名称都不可空');
                        return;
                    }

                    this.addingClassify.templates = [];
                    this.codeTemplates.push(this.addingClassify);
                    localStorage.setItem(CODE_TEMPLATE_CONFIG_KEY, JSON.stringify(this.codeTemplates));
                    refreshByKey(this, 'addClassifyModalShow', false);
                }}
                onCancel={() => { refreshByKey(this, 'addClassifyModalShow', false) }}
            >
                <div style={{ ...Css.vertical }}>
                    <div style={{ ...Css.transverse }}>
                        <span style={{ width: 130 }}>分类名称：</span>
                        <Input onChange={(e) => {
                            this.addingClassify.title = e.currentTarget.value;
                        }} />
                    </div>
                    <div style={{ ...Css.transverse, marginTop: 15 }}>
                        <span style={{ width: 130 }}>唯一编码：</span>
                        <Input placeholder='例如：biz_service_impl' onChange={(e) => {
                            this.addingClassify.code = e.currentTarget.value;
                        }} />
                    </div>
                </div>
            </Modal>
        )
    }

    /**
     * 添加模版弹窗
     */
    addTemplateModalShow = false;
    addTemplateModal = () => {
        return (
            <Modal
                key='addTemplateModal'
                title={'添加模版'}
                width={500}
                visible={this.addTemplateModalShow}
                closable
                okText={'确定'}
                cancelText={'取消'}
                onOk={() => {
                    if (arrayUtils.getKV(this.selectedClassify.templates, 'code', this.addingCodeTemplate.code)) {
                        message.warning('此编码已存在');
                        return;
                    }

                    if (stringUtils.isEmptyByObj(this.addingCodeTemplate, ['code', 'title']) === true) {
                        message.warning('编码和名称都不可空');
                        return;
                    }

                    this.selectedClassify.templates.push(this.addingCodeTemplate);
                    localStorage.setItem(CODE_TEMPLATE_CONFIG_KEY, JSON.stringify(this.codeTemplates));
                    if (this.props.onCodeTemplateChange) this.props.onCodeTemplateChange();
                    refreshByKey(this, 'addTemplateModalShow', false);
                }}
                onCancel={() => { refreshByKey(this, 'addTemplateModalShow', false) }}
            >
                <div style={{ ...Css.vertical }}>
                    <div style={{ ...Css.transverse }}>
                        <span style={{ width: 130 }}>模版名称：</span>
                        <Input onChange={(e) => {
                            this.addingCodeTemplate.title = e.currentTarget.value;
                        }} />
                    </div>
                    <div style={{ ...Css.transverse, marginTop: 15 }}>
                        <span style={{ width: 130 }}>唯一编码：</span>
                        <Input placeholder='例如：biz_service_impl' onChange={(e) => {
                            this.addingCodeTemplate.code = e.currentTarget.value;
                        }} />
                    </div>
                </div>
            </Modal>
        )
    }


    /**
     * 编辑代码模版弹窗
     */
    templateEditModalShow = false;
    templateEditModal = () => {

        if (!this._templateEditingData) return;

        // 成员代码块的【添加选项】列表
        let memberItems = [];
        for (let member of DYNAMIC_PARAMS) {
            if (member.type === 'code_block') {
                memberItems.push({
                    key: member.code,
                    label: (
                        <Button type='link' onClick={() => {
                            // 一个代码模版中，不允许添加相同的成员代码块
                            if (!this._templateEditingData.memberCode) this._templateEditingData.memberCode = [];
                            if (arrayUtils.getKV(this._templateEditingData.memberCode, 'code', member.code)) return;
                            // 添加成员代码块初始值
                            this._templateEditingData.memberCode.push(
                                { code: member.code, title: member.desc, bodyCode: '' }
                            );
                            refresh(this);
                        }}> {member.desc}</Button>
                    )
                })
            }
        }

        // 成员代码块内容列表
        let memberListView = [];
        if (this._templateEditingData && this._templateEditingData.memberCode) {
            for (let member of this._templateEditingData.memberCode) {
                memberListView.push(
                    <div>
                        {/* 标题 */}
                        <div style={{ ...Css.transverse, marginTop: 30 }}>
                            <span style={{ fontSize: 16, color: '#595959', fontWeight: 'bold' }}>
                                {member.title}({member.code})
                            </span>
                            <div style={{ flex: 1 }} />
                            <Button type='text' icon={<DeleteOutlined />} onClick={() => {
                                arrayUtils.removeKV(this._templateEditingData.memberCode, 'code', member.code);
                                refresh(this);
                            }}>删除</Button>
                        </div>
                        {/* 代码内容 */}
                        <TextArea value={member.bodyCode} autoSize={{ minRows: 10, maxRows: 15 }} onChange={(e) => {
                            member.bodyCode = e.currentTarget.value;
                            refresh(this);
                        }} />
                        {spaceH(30)}
                    </div>
                )
            }
        }

        return (
            <Modal
                key='templateEditModal'
                title={
                    // 代码模版名称的输入框
                    <Input style={{ width: 300 }} value={this._templateEditingData.title} onChange={(e) => {
                        this._templateEditingData.title = e.currentTarget.value;
                        refresh(this);
                    }} />
                }
                width={1050}
                height={500}
                visible={this.templateEditModalShow}
                closable
                okText='确定'
                cancelText='取消'
                onOk={() => {
                    objectCopy(this._templateEditingData, this.templateEditingData);
                    refreshByKey(this, 'templateEditModalShow', false);
                    localStorage.setItem(CODE_TEMPLATE_CONFIG_KEY, JSON.stringify(this.codeTemplates));
                    if(this.props.onChange) this.props.onChange(this.codeTemplates);
                }}
                onCancel={() => {
                    refreshByKey(this, 'templateEditModalShow', false);
                    this._templateEditingData = undefined;
                    this.templateEditingData = undefined;
                }}>
                <div style={{ height: 600, overflowY: 'scroll' }}>
                    {/* 主体代码块 */}
                    <span style={{ fontSize: 19, color: '#595959', fontWeight: 'bold' }}>
                        主体
                    </span>
                    <TextArea value={this._templateEditingData.bodyCode} autoSize={{ minRows: 10, maxRows: 15 }} onChange={(e) => {
                        this._templateEditingData.bodyCode = e.currentTarget.value;
                        refresh(this);
                    }} />

                    {/* 成员代码块 */}
                    <div style={{ ...Css.transverse, marginTop: 30 }}>
                        <span style={{ fontSize: 19, color: '#595959', fontWeight: 'bold' }}>
                            成员代码块
                        </span>
                        <Dropdown overlay={<Menu items={memberItems} />} placement="bottomRight">
                            <Button style={{ fontWeight: 'bold' }} type='link' icon={<PlusOutlined />}>添加</Button>
                        </Dropdown>
                    </div>
                    {/* 成员代码块内容列表 */}
                    {memberListView}
                </div>
            </Modal>
        )
    }

}
