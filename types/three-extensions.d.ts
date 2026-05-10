declare module "three/examples/jsm/controls/OrbitControls.js" {
  export { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
}

declare module "three/examples/jsm/loaders/STLLoader.js" {
  import { BufferGeometry, Loader, LoadingManager } from "three";

  export class STLLoader extends Loader<BufferGeometry> {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (geometry: BufferGeometry) => void,
      onProgress?: (event: ProgressEvent<EventTarget>) => void,
      onError?: (event: unknown) => void,
    ): void;
  }
}
