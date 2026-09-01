/**
 * overlayRadius
 *
 * Corner radius resolution for the flying overlay. Pure and Reanimated-free
 * so it can be unit tested without a renderer.
 */

/** The overlay container's borderRadius at both ends of the flight. */
export interface OverlayRadiusRange {
  start: number;
  end: number;
}

/**
 * `morphBorderRadius: false` means "do not animate the radius", not "drop it":
 * the cloned child's own radius is reset, so the overlay container is the only
 * thing rounding the corners and must hold the source radius for the flight.
 */
export function resolveOverlayRadius(
  morphBorderRadius: boolean,
  fromRadius: number,
  toRadius: number
): OverlayRadiusRange {
  return {
    start: fromRadius,
    end: morphBorderRadius ? toRadius : fromRadius,
  };
}
