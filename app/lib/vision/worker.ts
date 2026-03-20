import { processImageData } from "./algorithm";
import type {
  WorkerProcessMessage,
  WorkerResultMessage,
  WorkerProgressMessage,
} from "./types";

self.onmessage = (event: MessageEvent<WorkerProcessMessage>) => {
  const { type, imageData, species, depth } = event.data;
  if (type !== "process") return;

  const { imageData: resultImageData, stats } = processImageData(
    imageData,
    species,
    depth,
    (percent) => {
      const progressMsg: WorkerProgressMessage = { type: "progress", percent };
      self.postMessage(progressMsg);
    }
  );

  const resultMsg: WorkerResultMessage = {
    type: "result",
    imageData: resultImageData,
    stats,
  };
  self.postMessage(resultMsg, { transfer: [resultImageData.data.buffer] });
};
