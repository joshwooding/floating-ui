export type BasePlacement = 'top' | 'right' | 'bottom' | 'left';
export type VariationPlacement =
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end';
export type AutoPlacement = 'auto' | 'auto-start' | 'auto-end';
export type Placement = BasePlacement | VariationPlacement;
export type Strategy = 'absolute' | 'fixed';
export type Variation = 'start' | 'end';
export type Axis = 'x' | 'y';
export type Length = 'width' | 'height';

export type Platform = {
  getElementRects: (args: {
    reference: ReferenceElement;
    floating: FloatingElement;
    strategy: Strategy;
  }) => Promise<ElementRects>;
  convertOffsetParentRelativeRectToViewportRelativeRect: (args: {
    rect: Rect;
    offsetParent: Element | Window;
    strategy: Strategy;
  }) => Promise<Rect>;
  getOffsetParent: (args: {element: Element}) => Promise<Element | Window>;
  isElement: (value: unknown) => Promise<boolean>;
  getDocumentElement: (args: {element: Element}) => Promise<Element>;
  getClippingClientRect: (args: {
    element: Element;
    boundary: Boundary;
    rootBoundary: RootBoundary;
  }) => Promise<ClientRectObject>;
  getDimensions: (args: {element: HTMLElement}) => Promise<Dimensions>;
};

export type Coords = {
  x: number;
  y: number;
};

export type SideObject = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ModifiersData = {
  arrow?: {
    x?: number;
    y?: number;
    centerOffset: number;
  };
  autoPlacement?: {
    index?: number;
    skip?: boolean;
    overflows: Array<{
      placement: Placement;
      overflows: Array<number>;
    }>;
  };
  flip?: {
    index?: number;
    skip?: boolean;
    overflows: Array<{
      placement: Placement;
      overflows: Array<number>;
    }>;
  };
  hide?: {
    referenceHidden: boolean;
    escaped: boolean;
    referenceHiddenOffsets: SideObject;
    escapedOffsets: SideObject;
  };
  size?: Dimensions;
  [key: string]: any;
};

export type ComputePositionConfig = {
  platform: Platform;
  placement?: Placement;
  strategy?: Strategy;
  modifiers?: Array<Modifier>;
};

export type ComputePositionReturn = {
  x: number;
  y: number;
  placement: Placement;
  strategy: Strategy;
  modifiersData: ModifiersData;
};

export type ComputePosition = (
  reference: unknown,
  floating: unknown,
  config: ComputePositionConfig
) => Promise<ComputePositionReturn>;

export type ModifierReturn = Coords & {
  data: {
    [key: string]: any;
  };
};

export type Modifier = {
  name: string;
  fn: (
    modifierArguments: ModifierArguments
  ) => Partial<ModifierReturn> | Promise<Partial<ModifierReturn>>;
};

export type Dimensions = {
  width: number;
  height: number;
};

export type Rect = Coords & Dimensions;

export type ElementRects = {
  reference: Rect;
  floating: Rect;
};

export type ReferenceElement = any;
export type FloatingElement = any;

export type Elements = {
  reference: ReferenceElement;
  floating: FloatingElement;
};

export type ModifierArguments = Coords & {
  initialPlacement: Placement;
  placement: Placement;
  strategy: Strategy;
  modifiersData: ModifiersData;
  scheduleReset: (args: {placement: Placement}) => void;
  elements: Elements;
  rects: ElementRects;
  platform: Platform;
};

export type ClientRectObject = Rect & SideObject;
export type Padding = number | SideObject;
export type Boundary = any;
export type RootBoundary = 'viewport' | 'document';
export type Context = 'reference' | 'floating';

export {computePosition} from './computePosition';
export {rectToClientRect} from './utils/rectToClientRect';

export {arrow} from './modifiers/arrow';
export {autoPlacement} from './modifiers/autoPlacement';
export {flip} from './modifiers/flip';
export {hide} from './modifiers/hide';
export {offset} from './modifiers/offset';
export {shift, limitShift} from './modifiers/shift';
export {size} from './modifiers/size';