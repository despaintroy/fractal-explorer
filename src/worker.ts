import { Color, WorkerInput, WorkerOutput } from "./types";

self.addEventListener("message", receiveMessage);

function receiveMessage(e: MessageEvent<WorkerInput>) {
  const { start, end, id } = e.data;
  const colors: Color[][] = [];
  for (let i = start.x; i < end.x; i++) {
    colors[i] = [];
    for (let j = start.y; j < end.y; j++) {
      colors[i][j] = randomColor();
    }
  }

  const message: WorkerOutput = {
    id,
    start,
    end,
    colors,
  };
	
  self.postMessage(message);
}

function randomColor(): Color {
  return {
    r: Math.random() * 256,
    g: Math.random() * 256,
    b: Math.random() * 256,
  };
}
