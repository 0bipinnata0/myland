// import { createRoot } from "react-dom/client";
// import { App } from "./App";

import { JSX } from "react";


const jsx = <div>abc</div>

function createRoot(containerEl: HTMLElement) {
  return {
    render(el: JSX.Element) {
      console.info('el', el)
    }
  }
}


function renderInBrowser() {
  const containerEl = document.getElementById("root");
  if (!containerEl) {
    throw new Error("#root element not found");
  }
  createRoot(containerEl).render(jsx);
}

renderInBrowser();
