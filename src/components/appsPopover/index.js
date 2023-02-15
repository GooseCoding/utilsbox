
import { Component } from 'react';
import { Button, Popover, Badge } from 'antd';
import Css from '../../css/Css';
import urlUtils from '../../utils/urlUtils';
import RouteConfig from '../../configs/routes';
import { refreshByKey } from '../../utils';

/**
 * 应用入口弹窗
 */
export default class AppsPopover extends Component {

    /**
     * 在渲染前调用
     * */
    componentWillMount() {
        this.appsBadgeCount = localStorage.getItem('utilsbox.cn_appsBadgeCount');
        if (this.appsBadgeCount === null || this.appsBadgeCount === undefined) {
            this.appsBadgeCount = RouteConfig.routes.length;
        }
    }

    render() {

        return (
            <div style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
                <Popover
                    placement="bottomRight"
                    content={(
                        <div style={{ width: 600, ...Css.transverse, flexFlow: 'wrap', justifyContent: 'center' }}>
                            {this.getAppButtonList()}
                        </div>
                    )}
                >
                    <Button
                        onMouseEnter={() => {
                            refreshByKey(this, 'appsBadgeCount', 0);
                            localStorage.setItem('utilsbox.cn_appsBadgeCount', 0);
                        }}
                        type='link'
                        style={{ ...Css.transverseC, color: '#595959', fontWeight: 'bold', padding: 0, margin: 0 }}
                        icon={
                            <Badge count={this.appsBadgeCount}>
                                <img style={{ width: 30, height: 30, marginRight: 8, background: '#1890ff', borderRadius: 6, padding: 2 }} src='https://utilsbox.oss-cn-hangzhou.aliyuncs.com/apps-f.png' />
                            </Badge>
                        }>
                        {/* 工具箱 */}
                    </Button>
                </Popover>
            </div>
        )
    }

    /** 获取app按钮列表 */
    getAppButtonList = () => {
        let buttonList = [];
        for (let app of RouteConfig.routes) {
            buttonList.push(
                <Button type='text' style={{ display: 'flex', alignItems: 'center', minWidth: 265, marginBottom: 10, justifyContent: 'flex-start' }} onClick={() => {
                    urlUtils.openApp(app);
                }}>
                    {app.icon}
                    {app.appName}
                    {app.tags}
                </Button>
            )
        }
        return buttonList;
    }
}