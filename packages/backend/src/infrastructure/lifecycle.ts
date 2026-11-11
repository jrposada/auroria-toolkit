export type Lifecycle = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};
