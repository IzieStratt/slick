// Shapes sent from the page to the native glass module, see native/glass.mm

export type GlassShape = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  /** flat ops in the shape's own coordinates: 0 x y move, 1 x y line, 2 x1 y1 x2 y2 x y cubic, 3 close */
  path?: number[];
  tint?: [number, number, number, number];
  clear?: boolean;
  above?: boolean;
  shaped?: boolean;
  radius?: number;
  snap?: boolean;
};

export type GlassOptions = {
  spacing?: number;
  animate?: boolean;
  partial?: boolean;
};

export type GlassState = {
  supported: boolean;
  ready: boolean;
};
