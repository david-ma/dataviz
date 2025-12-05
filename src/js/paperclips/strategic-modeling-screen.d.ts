import { HalScreen, HalColors } from './hal-screen-base';
import './hal-screen-types';
type StrategicModelingData = {
    yomi?: number;
    strats?: Array<{
        name?: string;
        currentScore?: number;
    }>;
    rounds?: number;
    currentRound?: number;
};
export declare class StrategicModelingScreen extends HalScreen {
    private lastPayoffValues;
    private lastCurrentRound;
    private lastRounds;
    private tournamentRunning;
    private flashAnimationId;
    private cellRects;
    private initialized;
    private lastYomi;
    private lastStratsHash;
    constructor(opts: {
        container: string;
        colors: HalColors;
    });
    cancelFlashAnimation(): void;
    startFlashAnimation(roundsData: number): void;
    testAnimation(rounds?: number): void;
    draw(data?: StrategicModelingData): void;
    private initializeStaticElements;
    private updateDynamicContent;
    private updatePayoffMatrix;
    private updateTextElement;
    private updateTournamentProgress;
    private drawButton;
}
export {};
