import { abs, add, addmult, clampAbs, clampRect, mult, norm, point, pointsBounds, pointCopy, pointToArray, rectangle, rectanglesIntersect, sub } from "pixi-boilerplate/geom/index";
import { Body } from "pixi-boilerplate/physics/Body";

const STATIC_FRICTION = 300;
const STEPS_PER_SECOND = 10;
const FPS = 60;
const MAX_SKIP_STEPS = 5;

export class Physics {
  constructor(options) {
    const {services, stepDuration} = {
      stepDuration: 1000 / FPS / STEPS_PER_SECOND,
      ...options
    };

    const {renderer} = services;

    /**
     * @protected
     */
    this.services = services;

    /**
     * @protected
     */
    this.bodies = [];

    /**
     * @protected
     */
    this.map;

    /**
     * @protected
     */
    this.bounds = rectangle(0, 0, renderer.width, renderer.height);

    /**
     * @protected
     */
    this.extraMS = 0;

    /**
     * @protected
     */
    this.stepDuration = stepDuration;
  }

  /**
   * @public
   * @param {Rectangle} bounds 
   */
  setBounds(bounds) {
    this.bounds = bounds;
  }
  
  setMap(map) {
    this.map = map;
    this.setBounds(this.map.viewport);
  }

  /**
   * @public
   * @param {Body} body 
   * @param {number} priority 
   */
  addBody(body, priority) {
    if (!this.bodies.includes(body)) {
      this.bodies.splice(priority ? priority : 0, 0, body);
    }
  }

  /**
   * @public
   * @param {Body} body 
   */
  removeBody(body) {
    this.bodies = this.bodies.filter(bodyB => bodyB !== body);
  }

  /**
   * @public
   * @param {number} deltaTime 
   */
  update(deltaTime) {
    this.extraMS += deltaTime;
    const fixedDeltaTime = this.stepDuration / 1000;
    let steps = 0;
    while (this.extraMS > 0 && steps < MAX_SKIP_STEPS + STEPS_PER_SECOND) {
      for (const body of this.bodies) {
        const previousPosition = pointCopy(body.position);
        this.updateBody(fixedDeltaTime, body, STATIC_FRICTION);
        this.processMapCollisions(previousPosition, body);
        body.transform.translate = mult(-1, this.map.position);
      }
      this.extraMS -= this.stepDuration;
      steps++;
    } 
    if (steps >= MAX_SKIP_STEPS + STEPS_PER_SECOND) {
      this.extraMS = 0;
    }
  }

  updateBody(deltaTime, body, frictionCoef) {
    body.velocity = clampAbs(
      body.maxSpeed,
      addmult(
        deltaTime * body.mass, 
        body.acceleration,
        body.velocity
      )
    );

    // Apply friction
    const friction = mult(-deltaTime * body.mass * frictionCoef, norm(body.velocity));
    if (abs(friction) < abs(body.velocity)) {
      body.velocity = add(body.velocity, friction);
    } else {
      body.velocity = point(0, 0);
    }

    body.position = addmult(
      deltaTime, 
      body.velocity,
      body.position,
    );
  }

  updateVerletBody(deltaTime, body) {
    body.velocity = addmult(deltaTime, body.acceleration, body.velocity);
    body.position = addmult(deltaTime, body.velocity, body.position);
  }

  updateVerlet(deltaTime, verlet) {
    const previousPosition = pointCopy(verlet.position);
    verlet.position = (
      addmult(
        deltaTime * deltaTime, 
        verlet.acceleration,
        sub(verlet.position, previousPosition),
        verlet.position
      )
    );
    verlet.previousPosition = previousPosition;
  } 

  updateAngleConstraint(constraint) {
    constraint.end.position = add(
      constraint.end.position,
      mult(
        constraint.stiffness,
        addmult(
          -1,
          constraint.end.position,
          constraint.start.position,
          constraint.delta
        )
      )
    );
  }

  updateDistanceConstraint(constraint) {
    const difference = sub(constraint.end.position, constraint.start.position);
    const offset = mult(constraint.stiffness * (constraint.distance / abs(difference) - 1), difference);

    const totalMass = constraint.start.mass + constraint.end.mass;

    constraint.start.position = add(
      constraint.start.position,
      mult(-constraint.end.mass / totalMass, offset)
    );

    constraint.end.position = add(
      constraint.end.position,
      mult(constraint.start.mass / totalMass, offset)
    );
  }

  processMapCollisions(previousPosition, body) {
    if (this.map) {
      const displacement = sub(body.position, previousPosition);
      let bodyRect = getBodyBounds(body);
      const previousBodyRect = rectangle(
        ...pointToArray(addmult(-1, displacement, bodyRect)),
        bodyRect.width,
        bodyRect.height
      );
      const clipRect = pointsBounds([
        previousBodyRect, 
        add(point(previousBodyRect.width, previousBodyRect.height), previousBodyRect),
        add(displacement, previousBodyRect),
        add(displacement, point(previousBodyRect.width, previousBodyRect.height), previousBodyRect)
      ]);
      const tiles = this.map.getSolidTilesInRectangle(clipRect);
      body.position.y -= displacement.y;
      bodyRect = getBodyBounds(body);
      for (const tile of tiles) {
        if (rectanglesIntersect(bodyRect, tile)) {
          body.position.x = previousPosition.x;
          body.onMapCollide({type: 'map', normal: {x: 0, y: 1}});
          break;
        }
      }
      body.position.y += displacement.y;
      bodyRect = getBodyBounds(body);
      for (const tile of tiles) {
        if (rectanglesIntersect(bodyRect, tile)) {
          body.position.y = previousPosition.y;
          body.onMapCollide({type: 'map', normal: {x: 1, y: 0}});
          break;
        }
      }
    }
  }
}