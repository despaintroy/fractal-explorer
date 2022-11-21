import {
  Color,
  Coordinate,
  Transformation,
  WorkerInput,
  WorkerOutput,
} from "./types";
import Worker from "./worker.ts?worker";
import { v4 as uuidv4 } from "uuid";

const initialTransformation: Transformation = {
  x: 0.7,
  y: 0,
  zoom: 1.6,
};

let transformation: Transformation = { ...initialTransformation };

// Modify transformation on keypress
document.addEventListener("keydown", (e) => {
  const stepSize = 0.3 / transformation.zoom;
  switch (e.key) {
    case "ArrowUp":
      transformation.y += stepSize;
      break;
    case "ArrowDown":
      transformation.y -= stepSize;
      break;
    case "ArrowLeft":
      transformation.x += stepSize;
      break;
    case "ArrowRight":
      transformation.x -= stepSize;
      break;
    case "z":
      transformation.zoom *= 1.2;
      break;
    case "x":
      transformation.zoom /= 1.2;
      break;
    case "r":
      transformation = { ...initialTransformation };
      break;
  }

  drawImg();
});

// CANVAS
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const width = canvas.width;
const height = canvas.height;

drawImg();

function drawArea(start: Coordinate, end: Coordinate, colors: Color[][]) {
  const imageData = ctx.createImageData(end.x - start.x, end.y - start.y);

  for (let i = start.x; i < end.x; i++) {
    for (let j = start.y; j < end.y; j++) {
      const color = colors[i][j];
      const index = (i - start.x) * 4 + (j - start.y) * (end.x - start.x) * 4;
      imageData.data[index] = color.r;
      imageData.data[index + 1] = color.g;
      imageData.data[index + 2] = color.b;
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, start.x, start.y);
}

function drawImg(tileSize: number = 200): Promise<void> {
  return new Promise((resolve) => {
    const worker = new Worker();
    worker.addEventListener("message", receiveMessage);

    const tasks: WorkerInput[] = [];

    for (let i = 0; i < width; i += tileSize) {
      for (let j = 0; j < height; j += tileSize) {
        const start: Coordinate = { x: i, y: j };
        const end: Coordinate = {
          x: Math.min(i + tileSize, width),
          y: Math.min(j + tileSize, height),
        };
        const id = uuidv4();
        const task: WorkerInput = {
          id,
          start,
          end,
          width,
          height,
          transformation,
        };
        tasks.push(task);
      }
    }

    const outstandingTaskIds = tasks.map((task) => task.id);

    function receiveMessage(e: MessageEvent<WorkerOutput>) {
      const colors: Color[][] = e.data.values.map((row) =>
        row.map((shade) => ({
          r: shade * 255,
          g: shade * 255,
          b: shade * 255,
        }))
      );

      drawArea(e.data.start, e.data.end, colors);
      const index = outstandingTaskIds.indexOf(e.data.id);
      if (index > -1) {
        outstandingTaskIds.splice(index, 1);
      }
      if (outstandingTaskIds.length === 0) {
        worker.terminate();
        resolve();
      }
    }

    tasks.forEach((task) => worker.postMessage(task));
  });
}
