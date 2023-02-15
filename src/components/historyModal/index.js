
import { Popover, Pagination, Modal, Input, Divider, Button, Tabs, List, Popconfirm } from 'antd';
import { Component } from 'react';
import { gkey, refresh, spaceW } from '../../utils';
import dateUtils from '../../utils/dateUtils';

/**
 * 历史记录弹窗组件
 * @param {import('../../models/historyModal').HistoryModalProps} props
 */
export default class HistoryModal extends Component {

    /** 历史记录窗口展开关闭 */
    historyModalShow = false;

    /** 历史记录当前分页 */
    historyPage = 1;
    /** 星标记录当前分页 */
    starHistoryPage = 1;
    /** 历史记录总数 */
    historyTotal = 0;

    historyKey = () => 'utilsbox.cn_' + this.props.indexKey + '_history_';
    historyStarKey = () => 'utilsbox.cn_star_' + this.props.indexKey + '_history_';
    historyIndexListKey = () => 'utilsbox.cn_' + this.props.indexKey + '_history_index_list';
    historyStarIndexListKey = () => 'utilsbox.cn_star_' + this.props.indexKey + '_history_index_list';

    /**
     * 在渲染前调用
     * */
    componentWillMount() {
        this.historyTotal = {
            [this.historyIndexListKey()]: 0,
            [this.historyStarIndexListKey()]: 0
        }
        if (this.props.onLoaded) this.props.onLoaded(this);
    }

    render() {

        this.historyList = this.getHistoryList(this.historyIndexListKey(), this.historyPage);
        this.starHistoryList = this.getHistoryList(this.historyStarIndexListKey(), this.starHistoryPage);

        return (
            <div>
                {this.historyModal()}
            </div>
        )
    }


    historyModal = () => {
        return (
            <Modal
                key='historyModal'
                title="记录"
                width={1300}
                visible={this.props.visible}
                closable
                footer={null}
                onCancel={() => { if (this.props.onCancel) this.props.onCancel() }}>
                <Tabs style={{ marginTop: -20 }}
                    activeKey={this.historyTabKey ? this.historyTabKey : 'history'}
                    onChange={(key) => {
                        this.historyTabKey = key;
                        refresh(this);
                    }}>
                    <Tabs.TabPane tab="历史记录(前100)" key="history">
                        <List
                            bordered={false}
                            dataSource={this.historyList}
                            renderItem={item => (
                                <List.Item >
                                    <div key={gkey()} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

                                        {/* 请求信息 */}
                                        <div style={{ display: 'flex', alignItems: 'center' }}>

                                            {/* 自定义内容 */}
                                            {this.props.customRowContent ? this.props.customRowContent(item) : []}

                                            <Divider type='vertical' />
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <img style={{ width: 23, height: 23, marginRight: 5 }} src='https://xiaomingongju.oss-cn-hangzhou.aliyuncs.com/time.png' />
                                                <span style={{ fontSize: 16 }}>{item.createDate}</span>
                                            </div>

                                            {/* 操作按钮 */}
                                            <div style={{ flex: 1 }} />
                                            <Popover
                                                open={item.popoverOpen}
                                                trigger="click"
                                                content={
                                                    <div style={{ display: 'flex', flexDirection: 'column', width: 300, padding: 15 }}>
                                                        <Input placeholder='备注名称，选填' onChange={(e) => {
                                                            item.title = e.currentTarget.value;
                                                        }} />

                                                        <div style={{ marginTop: 15, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                            <Button onClick={() => {
                                                                item.popoverOpen = false;
                                                                refresh(this);
                                                            }}>取消</Button>
                                                            {spaceW(10)}
                                                            <Button type='primary' onClick={() => {
                                                                // 添加星标记录
                                                                this.addStarHistory(item);
                                                                // 切换到星标列表tab
                                                                this.historyTabKey = 'star';
                                                                this.starHistoryList = this.getHistoryList(this.historyStarIndexListKey(), this.starHistoryPage);
                                                                item.popoverOpen = false;
                                                                refresh(this);
                                                            }}>确认</Button>
                                                        </div>
                                                    </div>
                                                }
                                            >
                                                <Button type='text' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} icon={<img style={{ width: 25, height: 25 }} src='https://xiaomingongju.oss-cn-hangzhou.aliyuncs.com/star-n.png' />} onClick={() => {
                                                    // item.popoverOpen = true;
                                                    // refresh(this);
                                                }} />
                                            </Popover>

                                            <Button type='link' style={{ fontWeight: 'bold' }} onClick={() => {
                                                if (this.props.onSelected) this.props.onSelected(item);
                                                if (this.props.onCancel) this.props.onCancel();
                                            }}> 选择 </Button>
                                        </div>

                                    </div>
                                </List.Item>
                            )}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                            <Pagination showQuickJumper={true} defaultCurrent={this.historyPage}
                                total={this.historyTotal[this.historyIndexListKey()]}
                                pageSize={10} pageSizeOptions={['10']}
                                onChange={(page) => {
                                    this.historyPage = page;
                                    this.historyList = this.getHistoryList(this.historyIndexListKey(), this.historyPage);
                                    refresh(this);
                                }} />
                        </div>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="星标记录" key="star">
                        <List
                            bordered={false}
                            dataSource={this.starHistoryList}
                            renderItem={item => (
                                <List.Item >
                                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {/* 标题 */}
                                            {item.title
                                                ?
                                                <span style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 0 }}>{item.title}</span>
                                                :
                                                []
                                            }
                                        </div>

                                        {/* 内容 */}
                                        <div style={{ display: 'flex', alignItems: 'center' }}>

                                            {/* 自定义内容 */}
                                            {this.props.customRowContent ? this.props.customRowContent(item) : []}

                                            <Divider type='vertical' />
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <img style={{ width: 23, height: 23, marginRight: 5 }} src='https://xiaomingongju.oss-cn-hangzhou.aliyuncs.com/time.png' />
                                                <span style={{ fontSize: 16 }}>{item.createDate}</span>
                                            </div>

                                            {/* 操作按钮 */}
                                            <div style={{ flex: 1 }} />
                                            <Popconfirm
                                                title="确认要删除吗？"
                                                onConfirm={() => {
                                                    // 历史记录列表中删除这条
                                                    this.starHistoryList = this.removeHistoryListItem(this.historyStarIndexListKey(), item.key);
                                                    // 删除这条历史记录
                                                    localStorage.removeItem(item.key);
                                                    refresh(this);
                                                }}
                                                okText="确认"
                                                cancelText="取消"
                                            >
                                                <Button type='text' style={{ fontWeight: 'bold', color: '#595959' }} > 删除 </Button>
                                            </Popconfirm>

                                            <Button type='link' style={{ fontWeight: 'bold' }} onClick={() => {
                                                if (this.props.onSelected) this.props.onSelected(item);
                                                if (this.props.onCancel) this.props.onCancel();
                                            }}> 选择 </Button>
                                        </div>
                                    </div>
                                </List.Item>
                            )
                            }
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                            <Pagination showQuickJumper={true} defaultCurrent={this.starHistoryPage}
                                total={this.historyTotal[this.historyIndexListKey()]}
                                pageSize={10} pageSizeOptions={['10']}
                                onChange={(page) => {
                                    this.starHistoryPage = page;
                                    this.starHistoryPage = this.getHistoryList(this.historyIndexListKey(), this.starHistoryPage);
                                    refresh(this);
                                }} />
                        </div>
                    </Tabs.TabPane>
                </Tabs>
            </Modal >
        )
    }


    /**
     * 添加历史记录，最多保存100条历史记录
     * @param {请求数据} request 
     * @param {返回数据} result 
     */
    addHistory = (data) => {

        // 本次记录的索引
        let currentHistoryKey = this.historyKey() + Date.now();
        // 添加记录
        let historyData = JSON.stringify({ ...data, createDate: dateUtils.getCurrentTime(), key: currentHistoryKey });

        console.log('添加历史记录', currentHistoryKey, historyData)
        localStorage.setItem(currentHistoryKey, historyData);

        // 取历史记录索引列表
        let indexList = localStorage.getItem(this.historyIndexListKey());
        indexList = !indexList ? [] : indexList.split(',');
        // 添加最新的请求数据，最新的在最前面
        let newIndexList = [];
        newIndexList.push(currentHistoryKey);
        for (let item of indexList) {
            newIndexList.push(item);
        }
        // 大于100条，删除最后一条
        if (newIndexList.length > 100) {
            localStorage.removeItem(newIndexList.pop())
        }

        // 把索引列表更新到本地缓存
        localStorage.setItem(this.historyIndexListKey(), newIndexList);
    }

    /**
     * 获取历史记录列表
     * @param {列表key} listKey 
     * @param {当前分页} currentPage 
     * @returns 
     */
    getHistoryList = (listKey, currentPage) => {
        // 取索引列表
        let indexList = localStorage.getItem(listKey);
        if (!indexList) return;

        // 计算开始和截止的index
        let startIndex = (currentPage - 1) * 10;
        let endIndex = currentPage * 10;

        // 存储到localStorage里的数据是按逗号分隔的字符串，需要切分
        indexList = indexList.split(',');
        this.historyTotal[listKey] = indexList.length;

        // 按开始和截止的index取数据
        let resultList = [];
        for (let i = 0; i < indexList.length; i++) {
            let key = indexList[i];
            if (i >= startIndex && i < endIndex) {
                let history = localStorage.getItem(key);
                if (history) {
                    resultList.push(JSON.parse(history));
                }
            }

            if (i >= endIndex) break;
        }
        return resultList;
    }

    /**
     * 添加星标记录
     * @param {*} data 
     */
    addStarHistory = (data) => {
        // 添加星标记录
        let key = this.historyStarKey() + Date.now();
        localStorage.setItem(key, JSON.stringify({ ...data, key: key }));

        // 取星标历史记录索引列表
        let starIndexList = localStorage.getItem(this.historyStarIndexListKey());
        starIndexList = !starIndexList ? [] : starIndexList.split(',');

        // 添加到索引列表中，刚添加的排在最前面
        let newList = [];
        newList.push(key);
        for (let item of starIndexList) {
            newList.push(item);
        }
        localStorage.setItem(this.historyStarIndexListKey(), newList);
    }

    /**
     * 删除历史记录中某一项（星标记录、历史记录通用）
     * @param {*} listKey 
     * @param {*} historyKey 
     */
    removeHistoryListItem = (listKey, historyKey) => {
        // 取列表数据
        let list = localStorage.getItem(listKey);
        list = list.split(',');

        // 删除逻辑
        let newList = [];
        for (let _item of list) {
            if (historyKey !== _item) {
                newList.push(_item);
            }
        }

        // 更新列表
        localStorage.setItem(listKey, newList);
        return newList;
    }

}