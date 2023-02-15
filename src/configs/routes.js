
import { Tag } from 'antd';
import Css from '../css/Css';
import { icon } from './resource';
import { containerHeight } from '../utils';
import TableToCodeUtils from '../pages/tableToCode/';

/**
 * 图标背景
 * @param {*} content 
 * @returns 
 */
const iconBackground = (content) => {
    return (
        <div style={{ width: 30, height: 30, marginRight: 5, ...Css.transverseC, background: '#1890ff', borderRadius: 8 }}>
            {content}
        </div>
    );
}

/**
 * 路由
 * 目前页面不多，先写一个简单的路由，以后有需要了，再引入路由框架
 */
const routes = [
    {
        path: '/request',
        appCode: 'request',
        appName: 'HTTP请求',
        icon: iconBackground(<img style={{ width: 25, height: 25 }} src={icon.fabu} />),
        page: <div style={{ height: containerHeight() }} />
    }, {
        path: '/jsonutils',
        appCode: 'jsonutils',
        appName: 'JSON处理',
        icon: iconBackground(<img style={{ width: 25, height: 25 }} src={icon.json_f} />),
        page: <div style={{ height: containerHeight() }} />
    }, {
        path: '/bizcode',
        appCode: 'bizcode',
        appName: '业务代码生成器',
        icon: iconBackground(<img style={{ width: 23, height: 23 }} src={icon.code_f} />),
        page: <TableToCodeUtils context={this} />
    }, {
        path: '/textreplace',
        appCode: 'textreplace',
        appName: '字母大小写替换',
        icon: iconBackground(<img style={{ width: 25, height: 25 }} src={icon.string_replace_w} />),
        page: <div style={{ height: containerHeight() }} />
    }, {
        path: '/textcompressed',
        appCode: 'textcompressed',
        appName: '去除空格换行(压缩)',
        icon: iconBackground(<img style={{ width: 25, height: 25 }} src={icon.yasuo_f} />),
        page: <div style={{ height: containerHeight() }} />
    }, {
        path: '/timestamp',
        appCode: 'timestamp',
        appName: '时间戳转换',
        icon: iconBackground(<img style={{ width: 25, height: 25 }} src={icon.time_f} />),
        page: <div style={{ height: containerHeight() }} />
    }, {
        path: '/md5',
        appCode: 'md5',
        appName: 'MD5加密',
        icon: iconBackground(<div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', ...Css.transverseC }}>M</div>),
        page: <div style={{ height: containerHeight() }} />
    }, {
        path: '/autoconfig',
        appCode: 'autoconfig',
        appName: '自动化配置工具',
        icon: iconBackground(
            <img style={{ width: 25, height: 25 }} src={icon.auto_f} />
        ),
        page: <div style={{ height: containerHeight() }} />,
        tags: [<div style={{ width: 10 }} />, <Tag color='processing'>教程整理中</Tag>]
    },
]


export default {
    routes: routes,
}