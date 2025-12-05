import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
type ComputationalTelemetryData = {
    trust: number;
    processors: number;
    memory: number;
    opsHistory: number[];
    creatHistory: number[];
};
export declare class ComputationalTelemetryScreen extends HalScreen {
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    update(data: ComputationalTelemetryData): void;
    private drawWaveform;
}
export {};
