import { HalScreen } from './hal-screen-base';
import './hal-screen-types';
export declare class StrategicModelingScreen extends HalScreen {
    private lastPayoffValues;
    private lastCurrentRound;
    private lastRounds;
    private tournamentRunning;
    private flashAnimationId;
    private cellRects;
    constructor(opts: {
        container: string;
        colors: any;
    });
    cancelFlashAnimation(): void;
    startFlashAnimation(roundsData: number): void;
    draw(data?: {
        yomi?: number;
        strats?: any[];
        rounds?: number;
        currentRound?: number;
    }): void;
    private drawButton;
    private drawPayoffMatrix;
    private drawTournamentProgress;
}
