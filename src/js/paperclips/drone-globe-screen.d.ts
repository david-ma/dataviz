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
    private landGroup;
    private graticulePath;
    private agents;
    private factories;
    private nextAgentId;
    private globeRadius;
    private centerX;
    private centerY;
    private lastUpdate;
    private timer;
    private landData;
    private mapLoading;
    private spinSpeed;
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    update(data: DroneGlobeData): void;
    private initializeGlobe;
    private ensureMapLoaded;
    private renderMap;
    private updateAgents;
    private tick;
    private updateAgentPositions;
    private updateFactoryPositions;
}
export {};
