import { point, rectangle } from "pixi-boilerplate/geom";
import { rectangleToPoints } from "pixi-boilerplate/geom/index";

export class VerletBody {
  /**
   */
  constructor(options) {
    options = {
      position: point(0, 0),
      velocity: point(0, 0),
      acceleration: point(0, 0),
      anchor: point(0.5, 0.5),
      autoConstraints: true,
      ...options
    };

    if  (!options.points && !options.bounds) {
      options.bounds = rectangle(0, 0, 16, 16);
      options.points = rectangleToPoints(addmult(-1, dot(anchor, point(options.bounds.width, options.bounds.height)), options.bounds));
    } else if (!options.points) {
      options.points = rectangleToPoints(addmult(-1, dot(anchor, point(options.bounds.width, options.bounds.height)), options.bounds));
    } else if (!options.bounds) {
      options.bounds = box(points);
      options.bounds = add(dot(anchor, point(options.bounds.width, options.bounds.height)), options.bounds);
    }

    /**
     * @public
     */
    this.velocity = options.velocity;

    /**
     * @public
     */
    this.acceleration = options.acceleration;

    /**
     * @public
     */
    this.bounds = options.bounds;

    /**
     * @public
     */
    this.anchor = options.anchor;
    
    /**
     * @public
     */
    this.massPoints = options.points.map(({x, y}) => new Verlet(x, y, 1));

    /**
     * @public
     */
    this.centroid = new Verlet(0, 0, 1000);
    this.centroid.position = mult(1 / this.massPoints.length, add(...this.massPoints.map(point => point.position)));
    this.centroid.previousPosition = pointCopy(this.centroid.position);

    /**
     * @public
     */
    this.constraints = [];
    if (options.autoConstraints) {
      this.initConstraints();
    }
  }

  initConstraints() {
    const stiffness = 1;

    for (let i = 0; i < this.massPoints.length - 1; i++) {
      const start = this.massPoints[i];
      for (let j = i + 1; j < this.massPoints.length; j++) {
        const end = this.massPoints[j];
        this.constraints.push(new DistanceConstraint(start, end, stiffness));
      }
    }

    for (const point of this.massPoints) {
      this.constraints.push(new DistanceConstraint(this.centroid, point, stiffness));
    }

    this.constraints.push(new AngleConstraint(this.centroid, this.massPoints[0], 1));
  }
}