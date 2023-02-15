import { ReactNode } from "react";

/** 模版内容信息 */
interface HistoryModalProps {
    /** 索引key */
    indexKey: string;
    /** 是否展示 */
    visible: boolean;
    /** 自定义行数据的部分内容 */
    customRowContent: ReactNode;
    /** 组件加载完成，返回组件实例 */
    onLoaded: (instance) => void;
    /** 选中的数据 */
    onSelected: (tableInfo: TableInfo) => void;
    /** 取消/关闭弹窗按钮点击事件 */
    onCancel:()=>void;
}