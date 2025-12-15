declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.scss';

declare module '*.yaml' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any;
  export default data;
}

declare module '*.md' {
  const content: string;
  export default content;
}
