import { abs, add, addmult, clampAbs, clampRect, mult, norm, point, pointCopy, pwmult, rectangle, rectanglesIntersect, sub } from "pixi-boilerplate/geom";
import { Body } from "pixi-boilerplate/physics/Body";
import { intervalsIntersect, pointsBounds, pointToArray, transformTranslate, transform } from "pixi-boilerplate/geom/index";

export class Physics {
  constructor(options) {
    const {services, stepDuration} = {
      stepDuration: 1000 / 60 / 10,
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
    while (this.extraMS > 0) {
      for (const body of this.bodies) {
        const previousPosition = pointCopy(body.position);
        this.updateBody(fixedDeltaTime, body, 800);
        this.processMapCollisions(previousPosition, body);
        body.position = clampRect(this.bounds, body.position);
      }
      this.extraMS -= this.stepDuration;
    } 
  }

  processMapCollisions(previousPosition, body) {
    if (this.map) {
      const displacement = sub(body.position, previousPosition);
      let bodyRect = bodyBounds(body);
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
      const tiles = mapGetSolidTilesInClip(clipRect, this.map);
      body.position.y -= displacement.y;
      bodyRect = bodyBounds(body);
      for (const tile of tiles) {
        if (rectanglesIntersect(bodyRect, tile)) {
          body.position.x = previousPosition.x;
          break;
        }
      }
      body.position.y += displacement.y;
      bodyRect = bodyBounds(body);
      for (const tile of tiles) {
        if (rectanglesIntersect(bodyRect, tile)) {
          body.position.y = previousPosition.y;
          break;
        }
      }
    }
  }

  updateBody(deltaTime, body, frictionCoef) {
    body.velocity = clampAbs(
      body.maxSpeed,
      addmult(
        deltaTime, 
        body.acceleration,
        body.velocity
      )
    );

    // Apply friction
    const friction = mult(-deltaTime * frictionCoef, norm(body.velocity));
    if (abs(friction) < abs(body.velocity)) {
      body.velocity = add(body.velocity, friction);
    } else {
      body.velocity = point(0, 0);
    }

    body.position = addmult(
      deltaTime, 
      body.velocity,
      body.position
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
}

export function bodyBounds(body) {
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

export function mapGetSolidTilesInClip(clipRect, map) {
  const tiles = [];
  for (let tx = clipRect.x / map.tileSize.x | 0; tx < Math.ceil((clipRect.x + clipRect.width) / map.tileSize.x); tx++) {
    for (let ty = clipRect.y / map.tileSize.y | 0; ty < Math.ceil((clipRect.y + clipRect.height) / map.tileSize.y); ty++) {
      const tileId = map.data[tx + ty * map.tileCount.x];
      if (map.isSolid(tileId)) {
        const tile = rectangle(
          tx * map.tileSize.x,
          ty * map.tileSize.y,
          map.tileSize.x,
          map.tileSize.y
        );
        tiles.push(tile);
      }
    }
  }
  return tiles;
}