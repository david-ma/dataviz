import { d3 } from '../chart';
export type HalColors = {
    background: string;
    text: string;
    labelGrey?: string;
    grid?: string;
    primary?: string;
    secondary?: string;
    tertiary?: string;
    teal?: string;
    navy?: string;
    grey?: string;
    burgundy?: string;
    violet?: string;
    matrixBlue?: string;
    green?: string;
    red?: string;
    white?: string;
    darkNavy?: string;
    [key: string]: string | undefined;
};
export declare class HalScreenManager {
    private static instance;
    private screens;
    static getInstance(): HalScreenManager;
    register(screen: HalScreen): void;
    unregister(id: string): void;
    getScreen(id: string): HalScreen | undefined;
    getAllScreens(): HalScreen[];
    reportCard(): void;
}
declare global {
    interface Window {
        halScreens: HalScreenManager;
    }
}
export declare abstract class HalScreen {
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    protected id: string;
    protected width: number;
    protected height: number;
    protected background: string;
    protected colors: HalColors;
    protected visible: boolean;
    constructor(opts: {
        id: string;
        container: string;
        width: number;
        height: number;
        colors: HalColors;
    });
    draw(...args: any[]): void;
    getId(): string;
    clear(): void;
    show(): void;
    hide(): void;
    isVisible(): boolean;
    destroy(): void;
}
