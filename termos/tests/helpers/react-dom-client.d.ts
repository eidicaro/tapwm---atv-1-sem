// Types for the existing runtime used only by the isolated browser harness.
declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): { render(children: import('react').ReactNode): void; unmount(): void };
}
