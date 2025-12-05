import { HalScreen } from './hal-screen-base';
import './hal-screen-types';
export declare class ComputationalTelemetryScreen extends HalScreen {
    constructor(opts: {
        container: string;
        colors: any;
    });
    update(data: {
        trust: number;
        processors: number;
        memory: number;
        opsHistory: number[];
        creatHistory: number[];
    }): void;
    private drawWaveform;
}
