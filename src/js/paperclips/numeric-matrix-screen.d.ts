import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
export declare class NumericMatrixScreen extends HalScreen {
    private initialized;
    private lastValues;
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    draw(): void;
}
