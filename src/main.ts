// Load Web Workers
import Worker from "./worker.ts?worker";

const worker = new Worker();

worker.addEventListener("message", receiveMessage);

function receiveMessage(e: MessageEvent) {
  console.log(e.data);
}

worker.postMessage("world");
