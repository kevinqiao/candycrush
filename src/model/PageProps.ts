
export interface PagePattern {
    vw: number;
    vh: number;
    width: number;
    height: number;
    direction: number
}
export interface PagePosition {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
    // direction: number
}
export interface PageConfig {
    name: string;
    path?: string;
    uri: string;
    auth?: boolean;
    nohistory?: boolean;
    child?: string;
    children?: { name: string; path: string; uri: string }[];
    position?: {
        closeControl?: { btn: number; confirm: number; maskActive: number };
        direction: number;
        width: number;
        height: number;
    }
}
export default interface PageProps {
    name: string;
    ctx?: string;
    data?: any;
    params?: any;
    child?: string;
    anchor?: string;
    config: PageConfig;
    disableCloseBtn?: () => void;
    close?: (type: number) => void;
}
export interface PageItem {
    name: string;
    ctx?: string; //null|undefined-cover
    data?: any;
    params?: any;
    anchor?: string;
    child?: string;
}