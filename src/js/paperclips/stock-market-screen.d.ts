import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
type StockDatum = {
    id: number;
    symbol: string;
    price: number;
    profit: number;
    amount?: number;
};
type StockUpdatePayload = {
    stocks: StockDatum[];
    bankroll: number;
    portTotal: number;
};
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
        colors: HalColors;
    });
    update(data: StockUpdatePayload): void;
    draw(data: StockUpdatePayload): void;
    private drawProfitSummary;
    private drawStockCell;
}
export {};
