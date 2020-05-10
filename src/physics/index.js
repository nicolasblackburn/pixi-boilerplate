import { abs, cullInvisiblePoints, dot, mult, norm, sub } from "pixi-boilerplate/geom";
import { add, intervalsIntersect, rectangle, pointToArray, pwmult, point } from "pixi-boilerplate/geom/index";

/**
 * Check whether a moving segment seg0 and a static segment seg1 collide.
 * @param {Point} v - The movement of seg0
 * @param {Segment} seg0 
 * @param {Segment} seg1 
 * @returns {[] | [number, number]} If there are no collision, an empty array is returned otherwise a pair of numbers containing the time at which the collision started at index 0 and the time at which the collision ended at index 1.
 */
export function segmentsCollide(v, seg0, seg1) {
  const p_0 = seg0[0];
  const q_0 = seg1[0];
  const p_t = sub(seg0[1], seg0[0]);
  const q_t = sub(seg1[1], seg1[0]);

  const det = p_t.x * (-q_t.y) - p_t.y * (-q_t.x);

  if (det === 0) {
    // seg0 and seg1 are colinear

    const det = v.x * (-q_t.y) - v.y * (-q_t.x);
    
    if (det === 0) {
      // seg1 and v are colinear
      return [];

    } else {
      const t = dot(sub(q_0, p_0), v) / abs(v);

      if (0 > t || 1 < t) {
        return [];

      } else {
        const abs_q_t = abs(q_t);
        const q_t_norm = mult(1 / abs_q_t, norm(q_t));
        const r0 = dot(sub(seg1[1], p_0), q_t_norm);
        const r1 = dot(sub(seg1[1], seg0[1]), q_t_norm);

        if (r1 < 0 || 1 < r0) {
          return [];
  
        } else {
          return [t, t];
        }
      }
    }

  } else {

    const r_num = det * (q_t.y * (q_0.x - p_0.x) - q_t.x * (q_0.y - p_0.y));
    const r_denom = q_t.y * v.x - q_t.x * v.y;
    const s_num = det * (p_t.y * (q_0.x - p_0.x) - p_t.x * (q_0.y - p_0.y));
    const s_denom = p_t.y * v.x - p_t.x * v.y;
    
    if (r_denom === 0) {
      // v and seg1 are colinear
      return [];

    } else if (s_denom === 0) {
      // v and seg0 are colinear
      return [];

    } else {
      let r0 = r_num / r_denom;
      let r1 = r0 + det / r_denom;
      let s0 = s_num / s_denom;
      let s1 = s0 + det / s_denom;

      if (r1 < r0) {
        const swp = r1;
        r1 = r0;
        r0 = swp;
      }
      
      if (s1 < s0) {
        const swp = s1;
        s1 = s0;
        s0 = swp;
      }

      if (r1 < s0 || r0 > s1) {
        return [];

      } else {
        const t = Math.max(r0, s0);
        if (0 <= t && t <= 1) {
          return [t, Math.min(r1, s1)];

        } else {
          return [];
        }
      }
    }
  }
}

function* pointsIterateSegments(points) {
  for (let i = 0; i < points.length - 1; i++) {
    yield [points[i], points[i + 1]];
  }
}

/**
 * Checks wheter a moving polygon poly0 and a static polygon poly1 are colliding.
 * @param {Point} disp 
 * @param {Point[]} poly_0 
 * @param {Point[]} poly_1 
 * @returns {{t: number, p: Point, s: Segment}}
 */
export function convexPolygonsCollide(disp, poly_0, poly_1) {
  const [visi_0] = cullInvisiblePoints(disp, poly_0);
  const [visi_1] = cullInvisiblePoints(mult(-1, disp), poly_1);

  let collision;

  for (const [visi_a, visi_b] of [[visi_0, visi_1], visi_1, visi_0]) {
    for (const p of visi_a) {
      const seg_0 = [p, add(disp, p)];
      for (const seg_1 of pointsIterateSegments(visi_b)) {
        const [intersect, _t, _, D] = segmentsIntersect(seg_0, seg_1);
        if (intersect) {
          const t = _t / D;
          if (!collision || t < collision.t) {
            collision = {
              t,
              p,
              s: seg_1,
            };
          }
        }
      }
    }
  }
  
  return collision;
}

export function findCollisionNormal(seg0, seg1) {
  const p = sub(seg1[1], seg1[0]);
  const n = abs(p);
  const {x, y} = mult(1 / n, p);
  return {x: y, y: -x};
}

export function getBodyBounds(body) {
  return rectangle(
    ...pointToArray(sub(
      body.position, 
      body.bounds, 
      pwmult(body.anchor, point(body.bounds.width, body.bounds.height))
    )),
    body.bounds.width,
    body.bounds.height
  );
}