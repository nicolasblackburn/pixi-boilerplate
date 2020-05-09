export function resizeInto(viewport, bounds, container) {
  const scale = Math.min(viewport.width / bounds.width, viewport.height / bounds.height);
  container.scale.set(scale);
  container.position.set(
    (viewport.width - scale * bounds.width) / 2 - scale * bounds.x,
    (viewport.height - scale * bounds.height) / 2 - scale * bounds.y
  );
}