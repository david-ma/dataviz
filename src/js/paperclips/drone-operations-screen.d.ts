import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
type DroneMetrics = {
    harvesterLevel: number;
    wireDroneLevel: number;
    harvesterCost: number;
    wireDroneCost: number;
    availableMatter: number;
    unusedClips: number;
    droneRatio: number;
};
export declare class DroneOperationsScreen extends HalScreen {
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    update(data: DroneMetrics): void;
    private drawBar;
}
export {};
