export function resizeInto(viewport, bounds, container) {
  const scale = Math.min(viewport.width / bounds.width, viewport.height / bounds.height);
  container.scale.set(scale);
  container.position.set(
    (viewport.width - scale * bounds.width) / 2 - scale * bounds.x,
    (viewport.height - scale * bounds.height) / 2 - scale * bounds.y
  );
}

export function distribute(rectangles, options) {
  const {direction, spacing} = {
    direction: "ltr",
    spacing: 0,
    ...options
  };
  let [previous, ...rest] = rectangles;
  while (rest.length) {
    const current = rest[0];
    rest = rest.slice(1);
    if (direction === 'ltr') {
      current.x = previous.x + previous.width + spacing
      - (previous.anchor ? previous.anchor.x * previous.width : 0)
      - (previous.pivot ? previous.pivot.x : 0)
      - (current.anchor ? current.anchor.x * current.width : 0)
      - (current.pivot ? current.pivot.x : 0);

    } else if (direction === 'rtl') {
      current.x = previous.x - current.width - spacing
      - (previous.anchor ? previous.anchor.x * previous.width : 0)
      - (previous.pivot ? previous.pivot.x : 0)
      - (current.anchor ? current.anchor.x * current.width : 0)
      - (current.pivot ? current.pivot.x : 0);

    } else if (direction === 'utd') {
      current.y = previous.y + previous.height + spacing
      - (previous.anchor ? previous.anchor.y * previous.height : 0)
      - (previous.pivot ? previous.pivot.y : 0)
      - (current.anchor ? current.anchor.y * current.height : 0)
      - (current.pivot ? current.pivot.y : 0);

    } else if (direction === 'dtu') {
      current.y = previous.y + current.height - spacing
      - (previous.anchor ? previous.anchor.y * previous.height : 0)
      - (previous.pivot ? previous.pivot.y : 0)
      - (current.anchor ? current.anchor.y * current.height : 0)
      - (current.pivot ? current.pivot.y : 0);

    }

    previous = current;
  }
  return rectangles;
}

export function align(rectangles, options) {
  let {x, y} = {
    ...options
  };
  if (x === undefined && y == undefined) {
    x = 0.5;
  }
  const [first, ...rest] = rectangles;
  for (const rectangle of rest) {
    if (x !== undefined) {
      rectangle.x = first.x + x * (first.width - rectangle.width);
    } 
    if (y !== undefined) {
      rectangle.y = first.y + y * (first.height - rectangle.height);
    } 
  }
  return rectangles;
}

export function epipe(x, f, ...fs) {
  if (fs.length) {
    return fs.reduce((x, f) => f(x), f(x));
  } else {
    return f(x);
  }
}