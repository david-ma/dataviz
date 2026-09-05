export type MetricKey = 'subscribers' | 'revenue' | 'originals' | 'awards';
export type StreamingRow = {
    company: string;
    year: number;
    subscribersMillions?: number | null;
    revenueBillions?: number | null;
    originalsCount?: number | null;
    awards?: number | null;
    source?: string;
    note?: string;
};
export type MergerEvent = {
    acquirer: string;
    acquiree: string;
    year: number;
    note?: string;
    source?: string;
};
export type CompanySeriesPoint = {
    company: string;
    year: number;
    value: number;
};
export type CompanySeries = {
    company: string;
    points: CompanySeriesPoint[];
};
export type StackDatum = {
    year: number;
    [company: string]: number;
};
export type BuildSeriesResult = {
    companies: string[];
    years: number[];
    stackInput: StackDatum[];
    series: CompanySeries[];
};
export declare const applyMergers: (rows: StreamingRow[], mergers: MergerEvent[]) => StreamingRow[];
export declare const metricConfig: Record<MetricKey, {
    label: string;
    unit: string;
    accessor: (row: StreamingRow) => number | null;
    format: (value: number) => string;
}>;
export declare const buildSeries: (rows: StreamingRow[], mergers: MergerEvent[], metric: MetricKey) => BuildSeriesResult;
export declare const streamingRows: StreamingRow[];
export declare const mergers: MergerEvent[];
