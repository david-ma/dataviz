export type SankeyNode = {
    name: string;
    category: string;
};
export type SankeyLink = {
    source: string;
    target: string;
    value: number;
    year: number;
    label?: string;
};
export type SankeyData = {
    nodes: SankeyNode[];
    links: SankeyLink[];
    notes: string[];
};
export declare const filmMergers: SankeyData;
