export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Coordinate = {
  x: number;
  y: number;
};

export type Transformation = {
  x: number;
  y: number;
  zoom: number;
};

export type WorkerInput = {
  id: string;
  start: Coordinate;
  end: Coordinate;
  width: number;
  height: number;
  transformation: Transformation;
};

export type WorkerOutput = {
  id: string;
  start: Coordinate;
  end: Coordinate;
  values: number[][];
};

export class Complex {
  constructor(public r: number, public i: number) {}

  abs(): number {
    return Math.sqrt(this.r * this.r + this.i * this.i);
  }

  multiply(c: Complex): Complex {
    return new Complex(
      this.r * c.r - this.i * c.i,
      this.r * c.i + this.i * c.r
    );
  }

  add(c: Complex): Complex {
    return new Complex(this.r + c.r, this.i + c.i);
  }
}
