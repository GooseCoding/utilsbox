
import './App.css';
import urlUtils from './utils/urlUtils';
import arrayUtils from './utils/arrayUtils';
import RouteConfig from './configs/routes';
import Css from './css/Css';
import AppsPopover from './components/appsPopover';
import { Component } from 'react';
import { spaceH } from './utils'
import { TOP_MENU_HEIGHT } from './constants';

class App extends Component {

    /** 默认路由页面 */
    currentRoute = RouteConfig.routes[2];
    /** 当前显示的页面 */
    currentPage = this.currentRoute.page;

    /**
     * 在渲染前调用
     * */
    componentWillMount() {
        let routeItem = arrayUtils.getKV(RouteConfig.routes, 'appCode', urlUtils.getUrlParam('app'));
        if (routeItem) {
            this.currentRoute = routeItem;
            this.currentPage = routeItem.page;
        }
        document.title = this.currentRoute.appName + ' - 猿猿工具';
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: document.body.clientHeight, background: '#f5f5f5' }}>

                {/* 顶部导航 */}
                <div style={{
                    overflow: 'auto',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    paddingLeft: '5%',
                    paddingRight: '5%',
                    width: '100%', alignItems: 'center',
                    zIndex: 10, height: TOP_MENU_HEIGHT, display: 'flex', background: '#ffffff', borderBottom: '1px solid #f5f5f5', boxShadow: '3px 3px 10px #f5f5f5', alignItems: 'center'
                }}>
                    {/* 当前打开的App图标和标题 */}
                    <div style={{ ...Css.transverse }}>
                        <div style={{ transform: 'scale(1.6)', marginRight: 15 }}>
                            {this.currentRoute.icon}
                        </div>
                        <span style={{ fontSize: 27, fontWeight: 'bold' }}>{this.currentRoute.appName}</span>
                        {this.currentRoute.tags}
                    </div>

                    <div style={{ flex: 1 }} />
                    <AppsPopover />
                </div>

                {/* 页面 */}
                {spaceH(TOP_MENU_HEIGHT)}
                {this.currentPage}

                {/* 备案和版权申明 */}
                <div style={{ display: 'flex', justifyContent: 'center', height: 30, marginTop: -30, zIndex: 1000 }}>
                    <a target='_blank' href='https://beian.miit.gov.cn' style={{ color: '#8c8c8c', fontSize: 13 }}>桂ICP备2022004728号-2 </a>
                </div>
            </div >
        )
    }
}

export default App;
