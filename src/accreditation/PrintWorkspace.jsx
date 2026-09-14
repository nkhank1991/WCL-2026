import { useEffect, useState } from "react";
import { operationsApi as api, saveDownload, uaeDate } from "./operations-api";

export function PrintWorkspace({ config, run, onPreview }) {
  const [rows, setRows] = useState(null),
    [department, setDepartment] = useState(""),
    [selected, setSelected] = useState([]),
    [query, setQuery] = useState(""),
    [progress, setProgress] = useState("");
  const load = async () => {
    const result = await api("admin/print");
    setRows(result.items);
    return result.items;
  };
  useEffect(() => {
    run(load);
  }, []);
  const shown = (rows || []).filter(
    (r) =>
      r.department === department &&
      [r.name, r.organisation, r.id]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const toggle = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((i) => i !== id) : [...s, id],
    );
  async function download(ids) {
    setProgress("Preparing approved PDFs…");
    try {
      const latest = await load(),
        files = ids.map((id) => latest.find((r) => r.id === id));
      if (files.some((f) => !f))
        throw Error(
          "A selected credential changed. Refresh and review the current queue.",
        );
      const batches = [[]];
      let size = 0;
      for (const file of files) {
        if (
          size + file.bytes > 3 * 1024 * 1024 ||
          batches.at(-1).length === 100
        ) {
          batches.push([]);
          size = 0;
        }
        batches.at(-1).push(file.id);
        size += file.bytes;
      }
      for (let i = 0; i < batches.length; i++) {
        if (!batches[i].length) continue;
        setProgress(
          "Preparing download " + (i + 1) + " of " + batches.length + "…",
        );
        const blob = await api("admin/print", {
          action: "download",
          department,
          ids: batches[i],
        });
        saveDownload(
          blob,
          "WCL-S3_" + department + "_approved_" + (i + 1) + ".zip",
        );
      }
      setProgress(
        "Download dispatched. Check the saved files before printing. Physical output has not been recorded.",
      );
      await load();
      setSelected([]);
    } catch (e) {
      setProgress("");
      throw e;
    }
  }
  return (
    <>
      <p className="ops-lead">
        Choose a department, check the front and back, then download the
        approved files.
      </p>
      <div className="ops-toolbar">
        <label>
          Department
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setSelected([]);
              setProgress("");
            }}
          >
            <option value="">Choose a department</option>
            {config.departments
              .filter((d) => d.enabled)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
          </select>
        </label>
        <label className="ops-search">
          Find a badge
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, company or credential"
          />
        </label>
        <button onClick={() => run(load)}>Refresh</button>
      </div>
      <div className="ops-actions">
        <button
          className="ops-primary"
          disabled={!selected.length}
          onClick={() => run(() => download(selected))}
        >
          Download Selected{selected.length ? " (" + selected.length + ")" : ""}
        </button>
        <button
          disabled={!department || !shown.length}
          onClick={() =>
            run(() =>
              download(
                (rows || [])
                  .filter((r) => r.department === department)
                  .map((r) => r.id),
              ),
            )
          }
        >
          Download All Approved
        </button>
      </div>
      {progress && (
        <p className="ops-notice" role="status">
          {progress}
        </p>
      )}
      <section className="ops-panel">
        {!rows ? (
          <p role="status">Loading the print queue…</p>
        ) : !department ? (
          <div className="ops-empty">
            <h2>Your approved print queue</h2>
            <p>Select a department to see its current, fully approved PDFs.</p>
          </div>
        ) : !shown.length ? (
          <div className="ops-empty">
            <h2>No printable badges</h2>
            <p>
              Applications appear here only after all approvals and successful
              PDF generation. Issued, outdated, revoked and blocked files are
              excluded.
            </p>
          </div>
        ) : (
          <>
            <label className="ops-check">
              <input
                type="checkbox"
                checked={shown.every((r) => selected.includes(r.id))}
                onChange={(e) =>
                  setSelected(e.target.checked ? shown.map((r) => r.id) : [])
                }
              />
              Select all {shown.length} visible badges
            </label>
            <div className="ops-print-list">
              {shown.map((r) => (
                <article key={r.id}>
                  <label className="ops-check">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggle(r.id)}
                      aria-label={"Select " + r.name}
                    />
                    <span>
                      <strong>{r.name}</strong>
                      <small>
                        {r.organisation} · {r.category}
                      </small>
                    </span>
                  </label>
                  <div>
                    <strong>Version {r.version}</strong>
                    <small>
                      Design {r.designVersion} · {r.printStatus}
                    </small>
                    <small>{r.venues.join(", ")}</small>
                    {r.downloadedAt && (
                      <small>Assigned {uaeDate(r.downloadedAt)}</small>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      run(async () =>
                        onPreview(
                          await api("admin/print/" + r.id),
                          r.name + " · approved v" + r.version,
                        ),
                      )
                    }
                  >
                    Preview front & back
                  </button>
                </article>
              ))}
            </div>
            <div className="ops-actions">
              <button
                disabled={!selected.length}
                onClick={() => {
                  if (
                    confirm(
                      "Confirm these " +
                        selected.length +
                        " physical badges have matching fronts and backs, readable details and a checked QR code?",
                    )
                  )
                    run(async () => {
                      await api("admin/print", {
                        action: "printed",
                        department,
                        ids: selected,
                        outputChecked: true,
                      });
                      setSelected([]);
                      setProgress(
                        "Physical output recorded. These cards still require recipient verification and handover.",
                      );
                      await load();
                    });
                }}
              >
                Mark Printed
              </button>
              <button
                disabled={!selected.length}
                onClick={() => {
                  const reason = prompt(
                    "Describe the data or physical print issue:",
                  );
                  if (reason)
                    run(async () => {
                      await api("admin/print", {
                        action: "issue",
                        department,
                        ids: selected,
                        reason,
                      });
                      setSelected([]);
                      await load();
                    });
                }}
              >
                Report Issue
              </button>
            </div>
          </>
        )}
      </section>
      <p className="ops-caption">
        Each ZIP includes one two-page PDF per person and a version manifest. A
        download is not proof of printing or permission to enter. Larger
        departments download in numbered batches.
      </p>
    </>
  );
}
