import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
export declare class QuantumComputingScreen extends HalScreen {
    private initialized;
    private lastOperations;
    private phase;
    private lastTimestamp;
    private margin;
    private maxWaves;
    private rings;
    private nextRingId;
    private ringSpawnTimer;
    private ringSpawnInterval;
    private ringExpandRate;
    private ringGroup;
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    draw(): void;
    private spawnRing;
    private updateRings;
}
