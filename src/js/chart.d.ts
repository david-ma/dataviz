import * as d3 from 'd3';
import $ from 'jquery';
import 'datatables.net';
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
};
export type Coordinates = {
    latitude: number;
    longitude: number;
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
    innerHeight: number;
    innerWidth: number;
    fullscreen: boolean;
    projection?: any;
    update?: Function;
    svg: any;
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
    scratchpad(callback: (chart: Chart) => void): void;
    drawMap(options: {
        center?: Coordinates;
        json?: string;
        zoom?: number;
        markers?: Coordinates[];
        update: Function;
    }): void;
    venn(options: any): void;
}
type chartDataTableSettings = any & {
    element?: string;
    titles?: any;
    render?: any;
};
declare function decorateTable(dataset: any, newOptions?: chartDataTableSettings): any;
export declare function mapDistance(a: Coordinates, b: Coordinates): number;
export { Chart, decorateTable, _, $, d3 };
