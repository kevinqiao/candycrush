
export interface PagePattern {
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
export default interface PageProps {
    name: string;
    data: any;
    // position?: PagePosition;
    config?: any;
    disableCloseBtn?: () => void;
    exit?: () => void;
}