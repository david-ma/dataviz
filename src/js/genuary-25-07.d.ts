import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
export declare class PaperclipLoader {
    private static instance;
    private objModel;
    private materials;
    private readonly modelScale;
    private constructor();
    static getInstance(): PaperclipLoader;
    loadAssets(): Promise<void>;
    private loadOBJ;
    private loadMTL;
    createPaperclip(world: RAPIER.World): Paperclip | null;
}
export declare class Paperclip {
    mesh: THREE.Group;
    rigidBody: RAPIER.RigidBody;
    private readonly hitbox;
    constructor(model: THREE.Group, materials: MTLLoader.MaterialCreator, scale: number, world: RAPIER.World);
    update(): void;
}
export declare class Block {
    mesh: THREE.Mesh;
    rigidBody: RAPIER.RigidBody;
    private readonly size;
    constructor(world: RAPIER.World);
    update(): void;
}
