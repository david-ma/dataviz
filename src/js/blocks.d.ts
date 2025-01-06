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
export declare class Block {
    body: RAPIER.RigidBody;
    shape: ShapeType;
    radius: number;
    physicsRadius: number;
    colour: string;
    constructor(body: RAPIER.RigidBody, shape: ShapeType, radius: number, colour?: string);
    physicsVertices(): Float32Array;
    initPhysics(world: RAPIER.World): void;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
    rotation(): number;
    lightAngle(lightPoint: Position): number;
}
export declare class TriangleBlock extends Block {
    physicsVertices(): Float32Array;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
}
export declare class SquareBlock extends Block {
    physicsVertices(): Float32Array;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
}
export declare class CircleBlock extends Block {
    initPhysics(world: RAPIER.World): void;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
}
