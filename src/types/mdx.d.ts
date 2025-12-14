declare module '*.mdx' {
  import { MDXProps } from 'mdx/types';
  let MDXComponent: (props: MDXProps) => JSX.Element;
  export default MDXComponent;
}
