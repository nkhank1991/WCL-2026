import { useEffect, useState } from "react";
import { operationsApi as api } from "./operations-api";
const encode = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(Error("Could not read artwork."));
    reader.readAsDataURL(file);
  });

export function DesignWorkspace({ run, onPreview }) {
  const [rows, setRows] = useState(null),
    [selected, setSelected] = useState(null);
  const load = async () => {
    const r = await api("admin/designs");
    setRows(r.items);
    return r.items;
  };
  useEffect(() => {
    run(load);
  }, []);
  async function update(body) {
    const result = await api("admin/designs/" + selected.id, body);
    const items = await load();
    setSelected(items.find((d) => d.id === (result.id || selected.id)));
  }
  return (
    <>
      <p className="ops-lead">
        Each category has its own versioned front and back. Production uses
        published artwork only.
      </p>
      {!selected ? (
        <div className="ops-design-grid">
          {rows === null ? (
            <p role="status">Loading badge designs…</p>
          ) : (
            rows.map((d) => (
              <button
                className="ops-design-card"
                key={d.id}
                onClick={() => setSelected(d)}
              >
                <span
                  className="ops-design-band"
                  style={{
                    background: d.settings.color,
                    color: d.settings.darkText ? "#111d35" : "#fff",
                  }}
                >
                  {d.settings.label}
                </span>
                <span className="ops-art-pair">
                  {["Front", "Back"].map((side) => (
                    <span key={side}>
                      {d["has" + side] ? (
                        <img
                          loading="lazy"
                          src={
                            "/api/operations/admin/designs/" +
                            d.id +
                            "/" +
                            side.toLowerCase()
                          }
                          alt={side + " artwork"}
                        />
                      ) : (
                        <span>
                          {side}
                          <small>Artwork required</small>
                        </span>
                      )}
                    </span>
                  ))}
                </span>
                <strong>{d.settings.label}</strong>
                <small>
                  v{d.version} · {d.status} · {d.uses} credentials
                </small>
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          <button className="ops-back" onClick={() => setSelected(null)}>
            ← All badge designs
          </button>
          <section className="ops-panel">
            <div className="ops-section-heading">
              <h2>{selected.settings.label}</h2>
              <span className="ops-status">
                v{selected.version} · {selected.status}
              </span>
            </div>
            <div className="ops-actions">
              <button
                onClick={() =>
                  run(async () =>
                    onPreview(
                      await api("admin/designs/" + selected.id),
                      "Sample · " + selected.settings.label,
                    ),
                  )
                }
              >
                Preview front & back
              </button>
              {selected.status === "published" && (
                <button
                  onClick={() => run(() => update({ action: "new-version" }))}
                >
                  Create new design version
                </button>
              )}
            </div>
            <p>
              100 × 140 mm trim, 3 mm bleed. Upload clean 106:146 artwork
              without old names, photographs, barcodes, dates or sponsor
              lockups. No published design is edited in place.
            </p>
            {selected.status === "draft" && (
              <form
                key={selected.id}
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  run(() =>
                    update({
                      settings: Object.fromEntries(
                        [
                          "label",
                          "color",
                          "terms",
                          "termsVersion",
                          "supportEmail",
                        ].map((k) => [k, f.get(k)]),
                      ),
                    }),
                  );
                }}
              >
                <div className="ops-two">
                  <label>
                    Category label
                    <input
                      name="label"
                      required
                      defaultValue={selected.settings.label}
                    />
                  </label>
                  <label>
                    Category colour
                    <input
                      type="color"
                      name="color"
                      defaultValue={selected.settings.color}
                    />
                  </label>
                </div>
                <div className="ops-two">
                  {["front", "back"].map((side) => (
                    <label key={side}>
                      {side === "front" ? "Front" : "Back"} artwork
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (f)
                            run(async () => {
                              if (f.size > 2 * 1024 * 1024)
                                throw Error("Use artwork below 2 MB.");
                              await update({ [side]: await encode(f) });
                            });
                        }}
                      />
                      <small>
                        {selected[side === "front" ? "hasFront" : "hasBack"]
                          ? "Uploaded"
                          : "Not uploaded"}{" "}
                        · portrait PNG/JPEG, maximum 2 MB
                      </small>
                    </label>
                  ))}
                </div>
                <label>
                  On-card conditions
                  <textarea
                    name="terms"
                    rows={4}
                    maxLength={900}
                    required
                    defaultValue={selected.settings.terms}
                  />
                </label>
                <div className="ops-two">
                  <label>
                    Terms version
                    <input
                      name="termsVersion"
                      required
                      defaultValue={selected.settings.termsVersion}
                    />
                  </label>
                  <label>
                    Support email
                    <input
                      type="email"
                      name="supportEmail"
                      required
                      defaultValue={selected.settings.supportEmail}
                    />
                  </label>
                </div>
                <button>Save draft</button>
              </form>
            )}
            {selected.status === "draft" && (
              <form
                className="ops-publish"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  run(() =>
                    update({
                      action: "publish",
                      brandApproved: true,
                      printProofApproved: true,
                      reference: f.get("reference"),
                    }),
                  );
                }}
              >
                <h3>Publish after approval</h3>
                <label className="ops-check">
                  <input type="checkbox" required />
                  WCL has approved both artwork sides and on-card terms.
                </label>
                <label className="ops-check">
                  <input type="checkbox" required />
                  The actual-size physical print proof has been checked.
                </label>
                <label>
                  Approval / print-proof reference
                  <input name="reference" required minLength={8} />
                </label>
                <button
                  className="ops-primary"
                  disabled={!selected.hasFront || !selected.hasBack}
                >
                  Publish design version
                </button>
              </form>
            )}
          </section>
        </>
      )}
    </>
  );
}
