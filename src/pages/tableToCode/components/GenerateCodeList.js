
import { Component } from 'react';
import { Button, Tooltip, message, Collapse } from 'antd';
import { CaretRightOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import 'prismjs/themes/prism.css';
import Css from '../../../css/Css';
import Prism from 'prismjs';
import localUtils from '../../../utils/localUtils';
import {CODE_TEMPLATE_CONFIG_KEY} from '../../../constants/tableToCode';

const { Panel } = Collapse;


/**
 * 编辑表和字段信息组件
 * @param {GenerateCodeProps} props
 */
export default class GenerateCodeList extends Component {

    /** 表信息 extends TableInfo */
    tableInfo = undefined;
    /** 代码模版列表 extends CodeTemplate */
    codeTemplates = undefined;
    /** 代码模版配置文件名称，默认“代码模版配置” */
    tepmlateConfigFielName = '代码模版配置';

    /**
     * 在渲染前调用
     * */
    componentWillMount() {
    }

    render() {

        this.tableInfo = this.props.tableInfo ? this.props.tableInfo : {};
        this.codeTemplates = this.props.codeTemplates ? this.props.codeTemplates : {};
        
        return (
            <div style={{ ...Css.vertical }}>
                {this.generateCodeList()}
            </div>
        )
    }

    /**
     * 生成代码结果列表
     * @returns 
     */
    generateCodeList = () => {
        if (this.props.generated !== true) {
            return <div style={{ ...Css.transverseC, color: '#8c8c8c' }}>暂无代码内容</div>
        }

        // 模版名称组件，可以携带Tooltip
        let panelHeader = (template) => {
            let getTooltipView = ({ icon, title }) => {
                return (<Tooltip placement="topLeft" title={title}> {icon} </Tooltip>);
            }
            let templateCodeAdapter = {
                create_table_sql: getTooltipView({ icon: <ExclamationCircleOutlined />, title: '使用这段SQL创建表后，请通过自己常用的SQL客户端工具进行检查或完善' })
            }
            return (
                <div style={{ ...Css.transverse }}>
                    <span style={{ marginRight: 15 }}>{template.title}</span>
                    {templateCodeAdapter[template.code]}
                </div>
            )
        }

        /**
         * 创建一个代码内容折叠面板
         * @param {CodeTemplate} template 模版信息
         */
        let createCodePanel = (template) => {
            return (
                <Panel
                    header={panelHeader(template)}
                    key={template.code}
                >
                    {/* 代码内容 */}
                    <pre style={{ minHeight: 0, padding: 10, background: '#ffffff', position: 'relative' }}>
                        <code id={'codeViewId'} dangerouslySetInnerHTML={{
                            __html: Prism.highlight(template.generateCode ? template.generateCode : '', Prism.languages.javascript, 'java')
                        }} />

                        <Button
                            style={{ position: 'absolute', top: 10, right: 10 }}
                            type='link'
                            onClick={() => {
                                localUtils.copy(template.generateCode, () => message.success('复制成功'), () => message.fail('复制失败'));
                            }}>
                            复制
                        </Button>
                    </pre>
                </Panel>
            )
        }

        /**
         * 创建一个分类内容折叠面板
         * @param {TemplateClassify} classifyInfo 分类信息
         * @param {[]} codePanels 代码内容面板列表
         * @returns 
         */
        let createClassifyPanel = (classifyInfo, codePanels) => {
            return (
                <Panel header={classifyInfo.title} key={classifyInfo.classify} >
                    <Collapse
                        bordered={false}
                        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    >
                        {codePanels}
                    </Collapse>
                </Panel>
            )
        }

        // 遍历所有模版，根据代码内容，按分类生成代码内容对应的折叠面板
        let classifyCodes = [];
        let classifyPanels = [];
        for (let item of this.codeTemplates) {
            let classifyInfo = { ...item, templates: [] };
            let codePanels = [];
            for (let template of item.templates) {
                if (template.selectIon === true) {
                    classifyInfo.templates.push(template);
                    codePanels.push(createCodePanel(template))
                }
            }

            classifyPanels.push(createClassifyPanel(classifyInfo, codePanels));
            if (codePanels.length > 0) {
                classifyCodes.push(classifyInfo.classify);
            }
        }

        return (
            <Collapse
                defaultActiveKey={classifyCodes}
                bordered={false}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            >
                {classifyPanels}
            </Collapse>
        )
    }

}
