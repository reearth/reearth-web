/// <reference types="vite/client" />

declare module "*.yml" {
  const yml: any;
  export default yml;
}

declare module "*.yaml" {
  const yml: any;
  export default yml;
}

declare global {
  interface Window {
    React?: any;
    ReactDOM?: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "jsep" {
  function addLiteral(literal_name: string, literal_value: string): void;
}
