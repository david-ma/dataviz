declare let gitHash: string;
declare function asyncForEach(array: any[], limit: number, callback: (item: any, index: number, array: any[], done: () => void) => void): Promise<number>;
export { gitHash, asyncForEach };
