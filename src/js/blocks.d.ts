import RAPIER from '@dimforge/rapier2d';
import { Chart } from './chart';
export declare class RapierChart extends Chart {
    world: RAPIER.World;
    scale: number;
    colliders: RAPIER.Collider[];
    constructor(options: any);
    draw_colliders(): void;
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
};
export declare function blockFactory(options: BlockOptions): Block;
export declare class Block {
    body: RAPIER.RigidBody;
    shape: ShapeType;
    radius: number;
    physicsRadius: number;
    constructor(body: RAPIER.RigidBody, shape: ShapeType, radius: number);
    physicsVertices(): Float32Array;
    initPhysics(world: RAPIER.World): void;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
    rotation(): number;
    lightAngle(lightPoint: Position): number;
}
export declare class TriangleBlock extends Block {
    constructor(body: RAPIER.RigidBody, radius: number);
    physicsVertices(): Float32Array;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
}
export declare class SquareBlock extends Block {
    constructor(body: RAPIER.RigidBody, radius: number);
    physicsVertices(): Float32Array;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
}
export declare class CircleBlock extends Block {
    constructor(body: RAPIER.RigidBody, radius: number);
    initPhysics(world: RAPIER.World): void;
    draw(ctx: CanvasRenderingContext2D, position: Position, lightPoint: Position): void;
}
