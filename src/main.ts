import { Color, Coordinate, WorkerInput, WorkerOutput } from "./types";
import Worker from "./worker.ts?worker";
import { v4 as uuidv4 } from "uuid";

// CANVAS
const button = document.querySelector("button") as HTMLButtonElement;
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const width = canvas.width;
const height = canvas.height;

// button.addEventListener("click", () => drawImg(100));
button.addEventListener("click", testBlockSizes);

async function testBlockSizes() {
  const sizes = [800, 700, 600, 500, 400, 300, 200, 100, 50, 25, 10];

  for (const size of sizes) {
    const start = performance.now();
    await drawImg(size);
    const end = performance.now();
    console.log(`${Math.round(end - start)} ms for ${size}x${size} tiles`);
  }
}

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

function drawImg(tileSize: number): Promise<void> {
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
        const task: WorkerInput = { id, start, end };
        tasks.push(task);
      }
    }

    const outstandingTaskIds = tasks.map((task) => task.id);

    function receiveMessage(e: MessageEvent<WorkerOutput>) {
      drawArea(e.data.start, e.data.end, e.data.colors);
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
