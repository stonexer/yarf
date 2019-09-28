declare namespace JSX {
  interface Element {
    $$typeof: any;
    type: any;
    key: any;
    props: any;
  }

  interface IntrinsicElements {
    div: any;
    span: any;
  }
}
