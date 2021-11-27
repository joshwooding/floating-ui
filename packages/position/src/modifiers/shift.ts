import type {
  Modifier,
  Rect,
  Placement,
  ModifierArguments,
  Coords,
} from '../types';
import {getBasePlacement} from '../utils/getBasePlacement';
import {getMainAxisFromPlacement} from '../utils/getMainAxisFromPlacement';
import {getCrossAxis} from '../utils/getCrossAxis';
import {within} from '../utils/within';
import {
  detectOverflow,
  Options as DetectOverflowOptions,
} from '../utils/detectOverflow';

type Options = DetectOverflowOptions & {
  mainAxis: boolean;
  crossAxis: boolean;
  limiter: (modifierArguments: ModifierArguments) => Coords;
};

export const shift = (options: Partial<Options> = {}): Modifier => ({
  name: 'shift',
  async fn(modifierArguments: ModifierArguments) {
    const {x, y, placement} = modifierArguments;
    const {
      mainAxis: checkMainAxis = true,
      crossAxis: checkCrossAxis = false,
      limiter = ({x, y}) => ({x, y}),
      ...detectOverflowOptions
    } = options;

    const coords = {x, y};
    const overflow = await detectOverflow(
      modifierArguments,
      detectOverflowOptions
    );
    const mainAxis = getMainAxisFromPlacement(getBasePlacement(placement));
    const crossAxis = getCrossAxis(mainAxis);

    let mainAxisCoord = coords[mainAxis];
    let crossAxisCoord = coords[crossAxis];

    if (checkMainAxis) {
      const minSide = mainAxis === 'y' ? 'top' : 'left';
      const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
      const min = mainAxisCoord + overflow[minSide];
      const max = mainAxisCoord - overflow[maxSide];

      mainAxisCoord = within(min, mainAxisCoord, max);
    }

    if (checkCrossAxis) {
      const minSide = crossAxis === 'y' ? 'top' : 'left';
      const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
      const min = crossAxisCoord + overflow[minSide];
      const max = crossAxisCoord - overflow[maxSide];

      crossAxisCoord = within(min, crossAxisCoord, max);
    }

    return limiter({
      ...modifierArguments,
      [mainAxis]: mainAxisCoord,
      [crossAxis]: crossAxisCoord,
    });
  },
});

type LimitShiftOffset =
  | ((args: {placement: Placement; popper: Rect; reference: Rect}) => number)
  | number;

export type LimitShiftOptions = {
  offset: LimitShiftOffset;
  mainAxis: boolean;
  crossAxis: boolean;
};

export const limitShift =
  (
    options: Partial<LimitShiftOptions> = {}
  ): ((modifierArguments: ModifierArguments) => void) =>
  async (modifierArguments: ModifierArguments) => {
    const {x, y, placement, rects, modifiersData} = modifierArguments;
    const {
      offset = 0,
      mainAxis: checkMainAxis = true,
      crossAxis: checkCrossAxis = true,
    } = options;

    const coords = {x, y};
    const mainAxis = getMainAxisFromPlacement(getBasePlacement(placement));
    const crossAxis = getCrossAxis(mainAxis);

    let mainAxisCoord = coords[mainAxis];
    let crossAxisCoord = coords[crossAxis];

    const rawOffset =
      typeof offset === 'function'
        ? offset({...rects, placement})
        : {mainAxis: offset, crossAxis: 0};
    const computedOffset =
      typeof rawOffset === 'number'
        ? {mainAxis: rawOffset, crossAxis: 0}
        : // @ts-ignore - we want this to occur
          {mainAxis: 0, crossAxis: 0, ...rawOffset};

    if (checkMainAxis) {
      const len = mainAxis === 'y' ? 'height' : 'width';
      const refLen = rects.reference[len];
      const popLen = rects.popper[len];
      const limitMin =
        rects.reference[mainAxis] - popLen + computedOffset.mainAxis;
      const limitMax =
        rects.reference[mainAxis] + refLen - computedOffset.mainAxis;

      if (mainAxisCoord < limitMin) {
        mainAxisCoord = limitMin;
      } else if (mainAxisCoord > limitMax) {
        mainAxisCoord = limitMax;
      }
    }

    if (checkCrossAxis) {
      const len = mainAxis === 'y' ? 'width' : 'height';
      const refLen = rects.reference[len];
      const popLen = rects.popper[len];
      const limitMin =
        rects.reference[crossAxis] -
        popLen -
        (modifiersData.offset?.[mainAxis] ?? 0) +
        computedOffset.crossAxis;
      const limitMax =
        rects.reference[crossAxis] +
        refLen +
        (modifiersData.offset?.[mainAxis] ?? 0) +
        computedOffset.crossAxis;

      if (crossAxisCoord < limitMin) {
        crossAxisCoord = limitMin;
      } else if (crossAxisCoord > limitMax) {
        crossAxisCoord = limitMax;
      }
    }

    return {
      [mainAxis]: mainAxisCoord,
      [crossAxis]: crossAxisCoord,
    };
  };
