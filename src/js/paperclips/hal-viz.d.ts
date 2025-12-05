import { d3 } from '../chart';
declare class HalScreenManager {
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
declare abstract class HalScreen {
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    protected id: string;
    protected width: number;
    protected height: number;
    protected background: string;
    protected visible: boolean;
    constructor(container: string, id: string, width: number, height: number, background: string);
    abstract draw(): void;
    getId(): string;
    clear(): void;
    show(): void;
    hide(): void;
    isVisible(): boolean;
    destroy(): void;
}
export {};
