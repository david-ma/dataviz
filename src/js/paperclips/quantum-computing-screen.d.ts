import { HalScreen } from './hal-screen-base';
import './hal-screen-types';
export declare class QuantumComputingScreen extends HalScreen {
    constructor(opts: {
        container: string;
        colors: any;
    });
    draw(): void;
}
