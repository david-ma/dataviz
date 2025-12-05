import { HalScreen } from './hal-screen-base';
import './hal-screen-types';
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
        colors: any;
    });
    cancelFlashAnimation(): void;
    startFlashAnimation(roundsData: number): void;
    testAnimation(rounds?: number): void;
    draw(data?: {
        yomi?: number;
        strats?: any[];
        rounds?: number;
        currentRound?: number;
    }): void;
    private initializeStaticElements;
    private updateDynamicContent;
    private updatePayoffMatrix;
    private updateTextElement;
    private updateTournamentProgress;
    private drawButton;
}
