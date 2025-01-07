import RAPIER from '@dimforge/rapier2d';
import { Chart } from './chart';
export declare class RapierChart extends Chart {
    private static readonly PHYSICS_SCALE;
    private static readonly WALL_THICKNESS;
    world: RAPIER.World;
    scale: number;
    colliders: RAPIER.Collider[];
    constructor(options: any);
    private initPhysicsWorld;
    private createBoundaries;
    private positionBoundaries;
    dispose(): void;
    draw_colliders(): void;
    draw_blocks(blocks: Block[]): void;
}
export declare enum ShapeType {
    Circle = 0,
    Square = 1,
    Triangle = 2
}
export interface Block {
    body: RAPIER.RigidBody;
    shape: ShapeType;
    radius: number;
}
export type Position = {
    x: number;
    y: number;
};
export type BlockOptions = {
    world: RAPIER.World;
    position?: Position;
    radius?: number;
    rotation?: number;
    shape?: ShapeType;
    colour?: string;
};
export declare function blockFactory(options: BlockOptions): Block;
type Line = {
    start: Position;
    end: Position;
};
interface ShapeDefinition {
    vertices: [number, number][];
    edges: {
        start: [number, number];
        end: [number, number];
        normal: [number, number];
    }[];
}
export declare abstract class Block {
    body: RAPIER.RigidBody;
    shape: ShapeType;
    radius: number;
    physicsRadius: number;
    colour: string;
    vertices: ShapeDefinition;
    constructor(body: RAPIER.RigidBody, shape: ShapeType, radius: number, colour?: string);
    physicsVertices(): Float32Array;
    initPhysics(world: RAPIER.World): void;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
    rotation(): number;
    lightAngle(lightPoint: Position): number;
    drawHighlightedLine(ctx: CanvasRenderingContext2D, line: Line, lightPoint: Position): void;
}
export declare class TriangleBlock extends Block {
    vertices: ShapeDefinition;
}
export declare class SquareBlock extends Block {
    vertices: ShapeDefinition;
}
export declare class CircleBlock extends Block {
    initPhysics(world: RAPIER.World): void;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
}
export {};
