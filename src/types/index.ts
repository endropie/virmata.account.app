export type RecordRaw<R, RR = Record<string, unknown>> = {
  [K in keyof R]: R[K] | null;
} & {
  [K in keyof RR]: RR[K] | null;
};

export type InterfaceRaw<R, RR = Record<string, unknown>> = {
  [K in keyof R]?: R[K];
} & {
  [L in keyof RR]?: RR[L];
};
