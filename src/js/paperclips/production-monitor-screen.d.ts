import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
export declare class ProductionMonitorScreen extends HalScreen {
    private clipHistory;
    private fundsHistory;
    private wireHistory;
    private inventoryHistory;
    private maxHistory;
    private maxHistoryShort;
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    update(): void;
    draw(): void;
    private drawGrid;
    private drawTitle;
    private drawGraph;
    private drawStats;
}
