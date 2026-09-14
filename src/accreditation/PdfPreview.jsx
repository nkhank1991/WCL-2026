import { useEffect, useRef, useState } from "react";
import { saveDownload } from "./operations-api";

export default function PdfPreview({ blob, title, onClose, download = false }) {
  const dialog = useRef(),
    pages = useRef(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [zoom, setZoom] = useState(1);
  const [pdfUrl,setPdfUrl]=useState('');
  useEffect(()=>{
    if(!download)return;
    const url=URL.createObjectURL(blob);setPdfUrl(url);
    return ()=>URL.revokeObjectURL(url);
  },[blob,download]);
  useEffect(() => {
    dialog.current.showModal();
    return () => dialog.current?.close();
  }, []);
  useEffect(() => {
    let stopped = false,
      document;
    setLoading(true);
    setError("");
    (async () => {
      const [pdfjs, {default:workerUrl}] = await Promise.all([
        import("pdfjs-dist/build/pdf.mjs"),
        import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
      ]);
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      document = await pdfjs.getDocument({
        data: new Uint8Array(await blob.arrayBuffer()),
        isEvalSupported: false,
      }).promise;
      const fragment = window.document.createDocumentFragment();
      for (let n = 1; n <= document.numPages; n++) {
        const page = await document.getPage(n),
          canvas = window.document.createElement("canvas"),
          viewport = page.getViewport({ scale: 2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", n % 2 ? "Badge front" : "Badge back");
        await page.render({ canvasContext: canvas.getContext("2d"), viewport })
          .promise;
        const figure = window.document.createElement("figure"),
          caption = window.document.createElement("figcaption");
        caption.textContent = n % 2 ? "Front" : "Back";
        figure.append(canvas, caption);
        fragment.append(figure);
      }
      if (!stopped) {
        pages.current.replaceChildren(fragment);
        setLoading(false);
      }
    })().catch((e) => {
      if (!stopped) {
        setError("The PDF preview could not load. " + e.message);
        setLoading(false);
      }
    });
    return () => {
      stopped = true;
      document?.destroy();
    };
  }, [blob]);
  return (
    <dialog className="ops-pdf-dialog" ref={dialog} onCancel={onClose}>
      <header>
        <div>
          <p>BADGE PREVIEW</p>
          <h2>{title}</h2>
        </div>
        <button autoFocus onClick={onClose} aria-label="Close badge preview">
          Close
        </button>
      </header>
      <div className="ops-pdf-controls">
        <span>Front & back · 100 × 140 mm trim · 3 mm bleed</span>
        <label>
          Zoom
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          >
            <option value={0.75}>75%</option>
            <option value={1}>100%</option>
            <option value={1.25}>125%</option>
          </select>
        </label>
        {download && (
          <>
          <a href={pdfUrl||undefined} target="_blank" rel="noopener noreferrer">Open PDF to print</a>
          <button
            onClick={() => saveDownload(blob, "WCL-approved-preview.pdf")}
          >
            Save this PDF
          </button>
          </>
        )}
      </div>
      {loading && <p role="status">Rendering the actual PDF…</p>}
      {error && <p role="alert">{error}</p>}
      <div
        className="ops-pdf-pages"
        ref={pages}
        style={{ "--proof-width": 380 * zoom + "px" }}
      />
      <p className="ops-caption">
        On-screen size is illustrative. Print at Actual Size / 100% using the
        approved stock and duplex settings.
      </p>
    </dialog>
  );
}
