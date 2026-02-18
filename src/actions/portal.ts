export function portal(element: HTMLElement, portalId: string) {
  const portalElement = document.getElementById(portalId) || document.body;
  portalElement.appendChild(element);

  return {
    destroy() {
      portalElement.removeChild(element);
    },
  };
}
