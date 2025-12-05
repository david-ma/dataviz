import { HalScreen } from './hal-screen-base';
import './hal-screen-types';
export declare class PhaseIndicatorScreen extends HalScreen {
    private lastPhase;
    private initialized;
    constructor(opts: {
        container: string;
        colors: any;
    });
    draw(phaseText: string): void;
}
