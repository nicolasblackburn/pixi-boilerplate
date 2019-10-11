import * as PIXI from "pixi.js"; 

const app = new PIXI.Application({
  width: 900,
  height: 600,
  resolution: window.pixelDeviceResolution
});

document.body.appendChild(app.view);
const {stage} = app;

const points = [[20,0],[100,0],[120,20],[120,40],[100,60],[20,60],[0,40],[0,20], [20,0]];

function abs(p) {
    return Math.sqrt(p[0] * p[0] + p[1] * p[1]);
}

function add(p1, p2) {
    return [p1[0] + p2[0], p1[1] + p2[1]];
}

function sub(p1, p2) {
    return [p1[0] - p2[0], p1[1] - p2[1]];
}

function mult(a, p1) {
    return [a * p1[0], a * p1[1]];
}

function dist(p1, p2) {
    return abs(sub(p2, p1));
}

function lerp(points, t) {
    if (points.length < 1) {
        throw new Error("Cannot return lerp of a single point");
    } 
    if (t < 0 || points.length < 2) {
        return points[0];
    }
    const d = dist(points[0], points[1]);
    if (t < d) {
        return add(points[0], mult(t / d, sub(points[1], points[0]))); 
    } else {
        return lerp(points.slice(1), t - d);
    }
}

function perimeter(points) {
    if (points.length < 2) {
        return 0;
    } 
    return dist(points[0], points[1]) + perimeter(points.slice(1));
}

Object.assign(window, {points, abs, add, sub, mult, dist, lerp, perimeter});

const dolmen = new PIXI.Container();
stage.addChild(dolmen);
dolmen.addChild(makePoly(points, 0x334455));

const peri = perimeter(points);
const n = 20;
const newPoints = [...new Array(n)].map((_, i) => lerp(points, i * peri / n));
console.log(newPoints);

newPoints.forEach(p => {
    const circ = new PIXI.Graphics();
    circ.beginFill(0x009933);
    circ.drawCircle(...p, 6);
    stage.addChild(circ);
});

dolmen.position.set(100, 100);

function makePoly(points, color) {
    const poly = new PIXI.Graphics();
    if (points.length) {
        poly.beginFill(color);
        poly.moveTo(...points[0]);
        for (const [x, y] of points.slice(1)) {
            poly.lineTo(x, y);
        }
        poly.endFill();
    }
    return poly;
}