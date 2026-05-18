export const MIN_MAP_ZOOM = 1;
export const MAX_MAP_ZOOM = 4;

export function scaleCoordinate(value: number, sourceMax: number, renderedMax: number) {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(sourceMax) ||
    !Number.isFinite(renderedMax) ||
    sourceMax <= 0
  ) {
    return 0;
  }

  const clampedValue = Math.min(Math.max(value, 0), sourceMax);

  return (clampedValue / sourceMax) * renderedMax;
}
