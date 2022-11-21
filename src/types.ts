export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Coordinate = {
  x: number;
  y: number;
};

export type WorkerInput = {
	id: string;
  start: Coordinate;
  end: Coordinate;
};

export type WorkerOutput = {
	id: string;
  start: Coordinate;
  end: Coordinate;
  colors: Color[][];
};
