
export interface PagePosition {
    // top: number;
    // left: number;
    width: number;
    height: number;
    direction: number
}
export default interface PageProps {
    name: string;
    data: any;
    position?: PagePosition;
    config?: any;
    disableCloseBtn?: () => void;
    exit?: () => void;
}