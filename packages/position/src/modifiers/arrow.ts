import type {Modifier, ModifierArguments, Padding} from '../types';
import {getBasePlacement} from '../utils/getBasePlacement';
import {getLengthFromAxis} from '../utils/getLengthFromAxis';
import {getMainAxisFromPlacement} from '../utils/getMainAxisFromPlacement';
import {getSideObjectFromPadding} from '../utils/getPaddingObject';
import {within} from '../utils/within';

export type Options = {
  element: any;
  padding: Padding;
};

export const arrow = (options: Partial<Options> = {}): Modifier => ({
  name: 'arrow',
  async fn(modifierArguments: ModifierArguments) {
    const {element, padding = 0} = options;
    const {x, y, placement, rects, platform} = modifierArguments;

    const paddingObject = getSideObjectFromPadding(padding);
    const coords = {x, y};
    const basePlacement = getBasePlacement(placement);
    const axis = getMainAxisFromPlacement(basePlacement);
    const length = getLengthFromAxis(axis);
    const arrowDimensions = await platform.getDimensions({element});
    const minProp = axis === 'y' ? 'top' : 'left';
    const maxProp = axis === 'y' ? 'bottom' : 'right';

    const endDiff =
      rects.reference[length] +
      rects.reference[axis] -
      coords[axis] -
      rects.popper[length];
    const startDiff = coords[axis] - rects.reference[axis];

    const arrowOffsetParent = await platform.getOffsetParent({element});
    const clientSize = arrowOffsetParent
      ? axis === 'y'
        ? // @ts-ignore - fallback to 0
          arrowOffsetParent.clientHeight || 0
        : // @ts-ignore - fallback to 0
          arrowOffsetParent.clientWidth || 0
      : 0;

    const centerToReference = endDiff / 2 - startDiff / 2;

    // Make sure the arrow doesn't overflow the popper if the center point is
    // outside of the popper bounds
    const min = paddingObject[minProp];
    const max = clientSize - arrowDimensions[length] - paddingObject[maxProp];
    const center =
      clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset = within(min, center, max);

    return {
      data: {
        [axis]: offset,
        centerOffset: center - offset,
      },
    };
  },
});
