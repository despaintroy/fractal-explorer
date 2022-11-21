export type {};

self.addEventListener("message", receiveMessage);

function receiveMessage(e: MessageEvent) {
  self.postMessage("Hello, " + e.data + "!");
}
