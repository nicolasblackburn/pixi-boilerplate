import { abs, add, addmult, clampAbs, mult, norm, createPoint, pointsBounds, pointCopy, createRectangle, rectanglesIntersect, sub, Rectangle, Point } from "pixi-boilerplate/geom";
import { getBodyBounds } from "pixi-boilerplate/physics";
import { Body } from "pixi-boilerplate/physics/Body";
import { ApplicationServices } from "pixi-boilerplate/application/ApplicationServices";

const STATIC_FRICTION = 300;
const STEPS_PER_SECOND = 10;
const FPS = 60;
const MAX_SKIP_STEPS = 5;

export class Physics {
  protected services: ApplicationServices;
  protected bodies: Body[];
  protected map: any;
  protected bounds: Rectangle;
  protected extraMS: number;
  protected stepDuration: number;

  constructor(options) {
    const {services, stepDuration}: any = {
      stepDuration: 1000 / FPS / STEPS_PER_SECOND,
      ...options
    };

    const {renderer} = services;

    this.services = services;
    this.bodies = [];
    this.bounds = createRectangle(0, 0, renderer.width, renderer.height);
    this.extraMS = 0;
    this.stepDuration = stepDuration;
  }

  /**
   * @param {Rectangle} bounds 
   */
  public setBounds(bounds: Rectangle) {
    this.bounds = bounds;
  }
  
  public setMap(map: any) {
    this.map = map;
    this.setBounds(this.map.viewport);
  }

  /**
   * @param {Body} body 
   * @param {number} priority 
   */
  public addBody(body: Body, priority?: number) {
    if (!this.bodies.includes(body)) {
      this.bodies.splice(priority !== undefined ? priority : this.bodies.length - 1, 0, body);
    }
  }

  /**
   * @param {Body} body 
   */
  public removeBody(body: Body) {
    this.bodies = this.bodies.filter(bodyB => bodyB !== body);
  }

  /**
   * @param {number} deltaTime 
   */
  public update(deltaTime: number) {
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

  protected updateBody(deltaTime: number, body: Body, frictionCoef: number) {
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
      body.velocity = createPoint(0, 0);
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

  protected processMapCollisions(previousPosition: Point, body: Body) {
    if (this.map) {
      const displacement = sub(body.position, previousPosition);
      let bodyRect = getBodyBounds(body);
      const {x, y} = addmult(-1, displacement, bodyRect);
      const previousBodyRect = createRectangle(
        x,
        y,
        bodyRect.width,
        bodyRect.height
      );
      const clipRect = pointsBounds([
        previousBodyRect, 
        add(createPoint(previousBodyRect.width, previousBodyRect.height), previousBodyRect),
        add(displacement, previousBodyRect),
        add(displacement, createPoint(previousBodyRect.width, previousBodyRect.height), previousBodyRect)
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