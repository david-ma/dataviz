import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
type DroneGlobeData = {
    harvesterLevel: number;
    wireDroneLevel: number;
    factoryCount?: number;
};
export declare class DroneGlobeScreen extends HalScreen {
    private projection;
    private globeGroup;
    private agents;
    private solarPatches;
    private nextAgentId;
    private nextPatchId;
    private globeRadius;
    private centerX;
    private centerY;
    private lastUpdate;
    private timer;
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    update(data: DroneGlobeData): void;
    private initializeGlobe;
    private updateAgents;
    private tick;
}
export {};
