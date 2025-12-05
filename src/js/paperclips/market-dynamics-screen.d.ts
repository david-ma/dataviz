import { HalScreen } from './hal-screen-base';
import './hal-screen-types';
export declare class MarketDynamicsScreen extends HalScreen {
    constructor(opts: {
        container: string;
        colors: any;
    });
    update(data: {
        revenueHistory: number[];
        priceHistory: number[];
        demandHistory: number[];
        avgRev: number;
    }): void;
    private drawChart;
}
