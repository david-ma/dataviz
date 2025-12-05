import { HalScreen } from './hal-screen-base';
import './hal-screen-types';
export declare class HypnoDronesScreen extends HalScreen {
    private initialized;
    private lastHumanFlag;
    private lastProject35Flag;
    constructor(opts: {
        container: string;
        colors: any;
    });
    draw(): void;
    private drawContent;
    private drawGrid;
    triggerAnimation(): void;
    endAnimation(): void;
}
