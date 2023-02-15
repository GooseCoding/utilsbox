import { Component } from "react";
import { TOP_MENU_HEIGHT } from "../constants";

/**
 * 设置横向间隔
 * @param {number} num 
 * @returns 
 */
export const spaceW = (num) => {
    return (<div style={{ width: num }}></div>)
}

/**
 * 设置竖向间隔
 * @param {number} num 
 * @returns 
 */
export const spaceH = (num) => {
    return (<div style={{ height: num }}></div>)
}

/**
 * 刷新页面
 * @param {Component} self 
 */
export const refresh = (self) => {
    try {
        self.setState({
            ...self.state
        })
    } catch (e) {
        console.log('refreshError', e);
    }
}

/**
 * 设置当前实例内某个数据后刷新页面
 * @param {Component} self 
 * @param {string} key 
 * @param {any} value 
 */
export const refreshByKey = (self, key, value) => {
    self[key] = value;
    refresh(self);
}

/**
 * 对象复制（仅从source之中复制target存在的字段）
 * @param {object} source 
 * @param {object} target 
 */
export const objectCopy = (source, target) => {
    for (let key in source) {
        target[key] = source[key];
    }
}

/** 容器高度 */
export const containerHeight = () => {
    return document.body.clientHeight - TOP_MENU_HEIGHT;
}

/**
 * gkey
 * @returns 
 */
export const gkey = () => {
    let n = document.gkey ? document.gkey : 0;
    document.gkey = n += 1;
    return document.gkey;
}