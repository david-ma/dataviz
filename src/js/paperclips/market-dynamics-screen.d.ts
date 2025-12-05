import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
type MarketDynamicsData = {
    revenueHistory: number[];
    priceHistory: number[];
    demandHistory: number[];
    avgRev: number;
};
export declare class MarketDynamicsScreen extends HalScreen {
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    update(data: MarketDynamicsData): void;
    private drawChart;
}
export {};
