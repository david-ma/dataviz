import * as d3 from 'd3';
import * as THREE from 'three';
import $ from 'jquery';
import 'datatables.net';
import * as DataTables from 'datatables.net';
import _ from 'lodash';
type chartOptions = {
    element?: string;
    data?: any[] | {};
    title?: string;
    xLabel?: string;
    yLabel?: string;
    width?: number;
    height?: number;
    margin?: number | {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    colours?: string[];
    nav?: boolean;
    renderer?: 'canvas' | 'svg' | 'canvas-webgl2' | 'webgpu' | 'three.js';
};
type Position = {
    x: number;
    y: number;
};
export type Coordinates = {
    latitude: number;
    longitude: number;
    type?: string;
    url?: string;
    distance?: number;
    label?: string;
    draggable?: boolean;
};
type GeoipNames = {
    [key: string]: string;
};
export type Geoip = {
    city: {
        names: GeoipNames;
    };
    continent: {
        code: string;
        geoname_id: number;
        names: GeoipNames;
    };
    country: {
        geoname_id: number;
        is_in_european_union: boolean;
        iso_code: string;
        names: GeoipNames;
    };
    location: Coordinates;
    subdivisions: {
        names: GeoipNames;
    };
};
declare class Chart {
    opts: any;
    element: string;
    data: any;
    title: string;
    xLabel: string;
    yLabel: string;
    width: number;
    height: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    colours: Array<string>;
    color?: d3.ScaleOrdinal<string, any>;
    innerHeight: number;
    innerWidth: number;
    fullscreen: boolean;
    renderer?: 'canvas' | 'svg' | 'canvas-webgl2' | 'webgpu' | 'three.js';
    mouse_position: Position;
    projection?: any;
    calculate?: Function;
    loadingAnimation?: LoadingAnimation;
    svg: any;
    canvas: any;
    context: any;
    three_renderer: THREE.WebGLRenderer;
    plot: any;
    xScale: d3.ScaleLinear<number, number>;
    yBand: d3.ScaleBand<string>;
    constructor(opts: chartOptions);
    draw(): void;
    drawNav(): void;
    toggleFullscreen(chart?: Chart): void;
    cumulativeLineChart(): void;
    generalisedLineChart(options: {
        xField: string;
        yField: string;
        rounding: number;
        yFormat?: string;
        xFormat?: string;
        loggedX?: boolean;
        filter: string;
        types?: {
            label: string;
            color: string;
        }[];
    }): void;
    lineChart(): void;
    barGraph(): this;
    createScales(values: Array<any>): void;
    addAxes(): void;
    addxLabel(): void;
    addyLabel(): void;
    addChart(): void;
    circle(): this;
    squares(): this;
    treemap(): void;
    clear_canvas(): this;
    asyncScratchpad(callback: (chart: Chart) => Promise<void> | Promise<Chart>): Promise<Chart>;
    scratchpad(callback: (chart: Chart) => Chart | void): Chart;
    updateTreemap(data: any): this;
    initTreemap(options: {
        hierarchy: d3.HierarchyNode<any>;
        target: string;
        color?: d3.ScaleOrdinal<string, any>;
        maxDepth?: number;
    }): this;
    initMap(): Promise<unknown>;
    drawMap(options: {
        center?: Coordinates;
        json?: string;
        usa?: string;
        aus?: string;
        zoom?: number;
        markers?: Coordinates[];
        calculate: Function;
    }): void;
}
export type DataTableConfig = DataTables.Config & {
    element?: string;
    titles?: string[];
    render?: any;
    customData?: {
        [key: string]: any;
    };
    customRenderers?: {
        [key: string]: any;
    };
    columns?: DataTables.ConfigColumns[];
};
export type DataTableDataset = Array<any> & {
    columns?: Array<string>;
    [key: string]: any;
};
declare function decorateTable(dataset: DataTableDataset, newOptions?: DataTableConfig): DataTables.Api<any>;
interface LoadingAnimation {
    animate: () => void;
    stop: (options?: {
        goto?: [number, number];
    }) => Promise<any>;
}
export declare function mapDistance(a: Coordinates, b: Coordinates): number;
export { Chart, decorateTable, _, $, d3, classifyName };
declare function classifyName(name: string): string;
