export function lerp(from, to) {
  const t1 = typeof from;
  const t2 = typeof to;
  if (t1 === "number" && t1 === t2 && isFinite(from) && isFinite(to)) {
    return t => (1 - t) * from + t * to;
  } else {
    return t => t < 1 ? from : to;
  }
}

export function olerp(from, to) {
  return t => map(f => f(t), map(([v0, v1]) => lerp(v0, v1), join(from, to)))
}

export function interpolate(...points) {
    return t => {
        let value = 0;
        for (let i = 0; i < points.length; i++) {
            const [ti, xi] = (typeof points[i] === "number" ? [points[i], points[i]] : points[i]);
            let term = xi;
            for (let j = 0; j < points.length; j++) {
                if (j !== i) {
                    const [tj] = points[j];
                    term *= (t - tj) / (ti - tj);
                }
            }
            value += term;
        }
        return value;
    };
}

export function quadIn(t) {
  return t * t;
}

export function quadOut(t) {
  return 1 - (t - 1) * (t - 1);
}

export function quadInOut(t) {
  if (t < 0.5) {
      return t * t * 2;
  } else {
      return 1 - (t - 1) * (t - 1) * 2;
  }
}

export function bezier(p1, p2, p3, p4) {
  return t => {
      const t1 = Math.pow(1 - t, 3);
      const t2 = 3 * Math.pow(1 - t, 2) * t;
      const t3 = 3 * (1 - t) * Math.pow(t, 2);
      const t4 = Math.pow(t, 3);
      return {
          x: t1 * p1.x + t2 * p2.x + t3 * p3.x + t4 * p4.x,
          y: t1 * p1.y + t2 * p2.y + t3 * p3.y + t4 * p4.y
      };
  };
}