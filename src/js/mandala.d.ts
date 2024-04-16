type circleInfo = {
    x: number;
    y: number;
    r: number;
    color: string;
};
type curveInfo = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
    x4: number;
    y4: number;
};
type coords = {
    x: number;
    y: number;
};
declare const colors: string[];
declare function drawCircle(svg: any, circle: circleInfo): void;
declare function calculateCircles(radius: number, numCircles: number, center: coords): circleInfo[];
declare function calculateCurves(center: coords, left: coords, right: coords): curveInfo[];
declare function drawMandala(): void;
