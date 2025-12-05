import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
export declare class PhaseIndicatorScreen extends HalScreen {
    private lastPhase;
    private initialized;
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    draw(phaseText: string): void;
}
