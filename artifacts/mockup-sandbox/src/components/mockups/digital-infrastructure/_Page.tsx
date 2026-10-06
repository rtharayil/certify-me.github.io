import { useEffect, useRef } from "react";
import markup from "./_markup.json";
import "./_group.css";

export function ExtractedPage({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    const scripts: HTMLScriptElement[] = [];
    async function initialize() {
      for (const name of ["dci-pdf-check", "digital-credential-infrastructure", "dci-solution"]) {
        if (controller.signal.aborted) return;
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = `/__mockup/dci/assets4/js/${name}.js`;
          script.onload = () => resolve();
          script.onerror = () => resolve();
          scripts.push(script);
          document.body.appendChild(script);
        });
      }
    }
    void initialize();
    host.current?.querySelectorAll<HTMLAnchorElement>('a[href^="/"]:not([download])').forEach(link => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
    return () => { controller.abort(); scripts.forEach(script => script.remove()); };
  }, []);
  return <div ref={host} className={`dci-canvas-shell ${className}`} dangerouslySetInnerHTML={{ __html: markup }} />;
}
