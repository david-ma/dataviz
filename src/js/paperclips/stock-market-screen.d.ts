import { HalScreen } from './hal-screen-base';
import './hal-screen-types';
export declare class StockMarketScreen extends HalScreen {
    private candleData;
    private currentCandle;
    private profitHistory;
    private tickCount;
    private readonly CANDLE_SIZE;
    private readonly MAX_CANDLES;
    private readonly MAX_PROFIT_HISTORY;
    constructor(opts: {
        container: string;
        colors: any;
    });
    update(data: {
        stocks: any[];
        bankroll: number;
        portTotal: number;
    }): void;
    draw(data: {
        stocks: any[];
        bankroll: number;
        portTotal: number;
    }): void;
    private drawProfitSummary;
    private drawStockCell;
}
