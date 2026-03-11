declare global {
    interface Performance {
        memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
        };
    }
}
export declare function startMatrixBenchmark(): void;
export declare function isBenchmarkEnabled(): boolean;
