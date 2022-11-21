import { Complex, WorkerInput, WorkerOutput } from "./types";

self.addEventListener("message", receiveMessage);

function receiveMessage(e: MessageEvent<WorkerInput>) {
  const { start, end, width, height, transformation, id } = e.data;
  const values: number[][] = [];

  const aspect = width / height;
  const scale = 1 / transformation.zoom;
  const transformY = transformation.y;
  const transformX = transformation.x;

  const topLeft = new Complex(
    -2 * aspect * scale - transformX,
    -2 * scale - transformY
  );
  const bottomRight = new Complex(
    2 * aspect * scale - transformX,
    2 * scale - transformY
  );

  const xStep = (bottomRight.r - topLeft.r) / width;
  const yStep = (bottomRight.i - topLeft.i) / height;

  for (let i = start.x; i < end.x; i++) {
    values[i] = [];
    for (let j = start.y; j < end.y; j++) {
      const c = new Complex(topLeft.r + i * xStep, topLeft.i + j * yStep);
      const color = mandelbrot(c);
      values[i][j] = color;
    }
  }

  const outputMessage: WorkerOutput = {
    id,
    start,
    end,
    values,
  };

  self.postMessage(outputMessage);
}

function mandelbrot(c: Complex): number {
  let z = new Complex(0, 0);
  for (let i = 0; i < 100; i++) {
    z = z.multiply(z).add(c);
    if (z.abs() > 2) {
      return i / 100;
    }
  }
  return 1;
}
