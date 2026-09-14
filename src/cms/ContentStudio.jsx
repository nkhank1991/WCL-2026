import { refreshPublishedContent } from "../PublishedContent.jsx";
import { useEffect, useRef, useState } from "react";
import { can } from "../../server/policy.mjs";
import { cmsSchema, newContent, fieldValue, setField } from "./schema.js";
import { ContentField } from "./ContentFields.jsx";
import { RichCopy } from "./SiteContent.jsx";
import { ContentOverview } from "./ContentOverview.jsx";
import "./studio.css";

function RecordPreview({ record, collection }) {
  const image =
    record.image || record.thumbnail || record.logo || record.headshot;
  return (
    <div className="cms-record-preview">
      {image && <img src={image} alt="Selected image preview" />}
      <h3>{record.title || record.name || record.label}</h3>
      {record.line && <h3>{record.line}</h3>}
      <RichCopy
        text={
          record.copy ||
          record.summary ||
          record.intro ||
          record.description ||
          ""
        }
      />
      {record.action && (
        <span className="cms-preview-button">{record.action}</span>
      )}
      {record.secondary && (
        <span className="cms-preview-button">{record.secondary}</span>
      )}
      {(record.sections || []).map((s, i) => (
        <section key={i}>
          <h4>{s.title}</h4>
          <RichCopy text={s.body} />
        </section>
      ))}
      {collection === "footer" && (
        <ul>
          {record.links?.map((l, i) => (
            <li key={i}>
              {l.label} · {l.to}
            </li>
          ))}
        </ul>
      )}
      {collection === "navigation" && (
        <p>
          {record.label} → {record.to}
        </p>
      )}
      {collection === "social" && (
        <p>
          {record.label} · {record.url}
        </p>
      )}
      {record.facts && (
        <dl>
          {record.facts.map(([v, l], i) => (
            <div key={i}>
              <dt>{v}</dt>
              <dd>{l}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
export function ContentStudio({ run, user, api, onDirtyChange }) {
  const [collection, setCollection] = useState("hero"),
    [overview, setOverview] = useState(true),
    [reload, setReload] = useState(0),
    [rows, setRows] = useState([]),
    [record, setRecord] = useState(null),
    [value, setValue] = useState(null),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [history, setHistory] = useState(null),
    [schedule, setSchedule] = useState(""),
    [preview, setPreview] = useState(false),
    [publication, setPublication] = useState(null);
  const form = useRef(null),
    heading = useRef(null),
    generation = useRef(0),
    definition = cmsSchema[collection];
  const writable = can(user.role, "content:write"),
    publisher = can(user.role, "content:publish");
  const dirty =
    !!value && JSON.stringify(value) !== JSON.stringify(record?.draft || null);
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);
  const safeLeave = () =>
    !dirty || window.confirm("Discard the unsaved changes to this draft?");
  useEffect(() => {
    if (!dirty) return;
    const block = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", block);
    return () => window.removeEventListener("beforeunload", block);
  }, [dirty]);
  useEffect(() => {
    if (overview) return;
    const current = ++generation.current;
    setRows([]);
    setRecord(null);
    setValue(null);
    setError("");
    setHistory(null);
    setQuery("");
    setFilter("all");
    setNotice("");
    setBusy(true);
    api("admin/content?collection=" + collection)
      .then((data) => {
        if (generation.current !== current) return;
        const items = data.items.filter((r) => r.draft.path !== "/sitemap");
        setRows(items);
        setRecord(items[0] || null);
        setValue(items[0] ? structuredClone(items[0].draft) : null);
      })
      .catch((e) => {
        if (generation.current === current) setError(e.message);
      })
      .finally(() => {
        if (generation.current === current) setBusy(false);
      });
    return () => {
      generation.current++;
    };
  }, [collection, overview, reload]);
  useEffect(() => {
    if (!overview) heading.current?.focus({ preventScroll: true });
  }, [collection, overview]);
  useEffect(() => {
    const refresh = () =>
      api("admin/publication")
        .then(setPublication)
        .catch(() => {});
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, []);
  const choose = (r) => {
    if (!safeLeave()) return;
    setRecord(r);
    setValue(structuredClone(r.draft));
    setHistory(null);
    setError("");
    setNotice("");
    setPreview(false);
    setSchedule("");
  };
  const chooseArea = (key) => {
    if (busy || !safeLeave()) return;
    setPreview(false);
    setSchedule("");
    setOverview(false);
    setCollection(key);
  };
  async function action(kind, extra = {}) {
    if (busy) return;
    if (kind === "save" && !form.current.reportValidity()) return;
    if (
      ["unpublish", "archive"].includes(kind) &&
      !window.confirm(
        "Remove this item from the published website? Its revision history will be retained.",
      )
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const next = await api(
        "admin/content" + (record ? "/" + encodeURIComponent(record.id) : ""),
        {
          action: kind,
          collection,
          version: record?.version,
          payload: kind === "save" ? value : undefined,
          ...extra,
        },
      );
      if (["publish", "unpublish", "archive"].includes(kind))
        refreshPublishedContent();
      setRecord(next);
      setValue(structuredClone(next.draft));
      setRows(
        (await api("admin/content?collection=" + collection)).items.filter(
          (r) => r.draft.path !== "/sitemap",
        ),
      );
      setPublication(await api("admin/publication"));
      setNotice(
        {
          save: "Draft saved. The published website is unchanged.",
          submit: "Sent for review.",
          approve: "This revision is approved for publishing.",
          publish: "Published to the content service.",
          restore: "Restored as a new draft. Review it before publishing.",
          unpublish: "Removed from the published website.",
          archive: "Archived. Revision history is preserved.",
          schedule: "Publication scheduled.",
        }[kind],
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const shown = rows.filter(
    (r) =>
      (filter === "all" || r.state === filter) &&
      [r.draft.title, r.draft.name, r.draft.label, r.draft.id]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const changeField = (f, next) =>
    setValue((current) => {
      const updated = setField(current, f.key, next);
      if (collection === "fixtures" && f.key === "startsAt" && next) {
        const date = new Date(next);
        updated.date = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Dubai",
        });
        updated.time = date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Dubai",
        });
        updated.timeZone = "Asia/Dubai";
      }
      return updated;
    });
  const fields = definition.fields.filter(
    (f) =>
      !(
        collection === "fixtures" &&
        value?.startsAt &&
        ["date", "time", "timeZone"].includes(f.key)
      ) &&
      !(
        collection === "pages" &&
        f.key === "sections" &&
        !["/privacy", "/cookies", "/terms", "/about"].includes(value?.path)
      ) &&
      !(
        collection === "hero" &&
        ["schedule", "bangladesh"].includes(value?.id) &&
        ["image", "alt", "players", "videoId"].includes(f.key)
      ),
  );
  const states = {
    draft: "Draft",
    review: "In review",
    approved: "Approved",
    published: "Published",
    scheduled: "Scheduled",
    archived: "Archived",
  };
  return (
    <div
      className="cms-workspace"
      aria-busy={busy}
      data-collection={overview ? "overview" : collection}
    >
      {!overview && (
        <div className="cms-intro">
          <div>
            <button
              className="cms-back"
              type="button"
              disabled={busy}
              onClick={() => {
                if (!safeLeave()) return;
                setValue(null);
                setRecord(null);
                setOverview(true);
              }}
            >
              ← All editing areas
            </button>
            <h2 ref={heading} tabIndex={-1}>
              {definition.label}
            </h2>
            {definition.description && <p>{definition.description}</p>}
          </div>
          <a href={definition.path} target="_blank" rel="noopener noreferrer">
            View website ↗
          </a>
        </div>
      )}
      {overview && <ContentOverview onChoose={chooseArea} />}
      {(overview ||
        ["failed", "configuration-error"].includes(publication?.state)) && (
        <details className="cms-publication">
          <summary>
            Publishing connection{" "}
            <span>
              {publication?.configured ? "Connected" : "Setup needed"}
            </span>
          </summary>
          <div role="status">
            <span>
              {publication?.state === "requested"
                ? "Search-page rebuild requested. Check the deployment before treating it as live."
                : publication?.state === "queued"
                  ? "Search-page rebuild queued."
                  : publication?.state === "configuration-error"
                    ? "The deployment connection needs an administrator to check its configuration."
                    : publication?.state === "failed"
                      ? "Search-page rebuild failed. Your published content is safe; retry the connection."
                      : publication?.configured
                        ? "Automatic search-page rebuild is connected."
                        : "Published content is available on the connected content service. Deploying the live website and search pages still requires the hosting connection."}
            </span>
            {publisher && publication?.configured && (
              <button
                type="button"
                onClick={() =>
                  run(async () =>
                    setPublication(await api("admin/publication", {})),
                  )
                }
              >
                Retry rebuild
              </button>
            )}
          </div>
        </details>
      )}
      {!overview && (
        <>
          <div className="cms-toolbar">
            <label>
              Content area
              <select
                aria-label="Content area"
                value={collection}
                disabled={busy}
                onChange={(e) => chooseArea(e.target.value)}
              >
                {Object.entries(cmsSchema).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            {rows.length > 1 && (
              <>
                <label>
                  Find an item
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or title"
                  />
                </label>
                <label>
                  Status
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    {Object.entries(states).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {writable && !definition.fixed && (
              <button
                type="button"
                disabled={busy}
                className="admin-primary"
                onClick={() => {
                  if (!safeLeave()) return;
                  setRecord(null);
                  setValue(newContent(collection, rows.length));
                  setHistory(null);
                  setNotice("");
                  setError("");
                }}
              >
                Add item
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className="admin-error">
              {error}
              {!rows.length && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setReload((v) => v + 1)}
                >
                  Try again
                </button>
              )}
            </p>
          )}
          {notice && (
            <p role="status" className="cms-success">
              {notice}
            </p>
          )}
          {busy && !value && (
            <p className="cms-loading" role="status">
              Loading {definition.label.toLowerCase()}…
            </p>
          )}
          {rows.length > 1 && (
            <div className="cms-mobile-records">
              <label htmlFor="cms-record-choice">
                Choose an item <span>{shown.length} available</span>
              </label>
              <select
                id="cms-record-choice"
                value={record?.id || ""}
                disabled={busy || !shown.length}
                onChange={(e) => {
                  const next = rows.find((r) => r.id === e.target.value);
                  if (next) choose(next);
                }}
              >
                {!shown.some((r) => r.id === record?.id) && (
                  <option value="">Select an item</option>
                )}
                {shown.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.draft.title ||
                      r.draft.name ||
                      r.draft.label ||
                      r.draft.id}
                  </option>
                ))}
              </select>
              {!shown.length && !busy && (
                <p>No matching items. Clear the search or change the status.</p>
              )}
            </div>
          )}
          <div className="cms-columns">
            <div
              className="cms-records"
              aria-label={definition.label + " records"}
            >
              <p>
                {shown.length} {shown.length === 1 ? "item" : "items"}
              </p>
              {shown.map((r) => (
                <button
                  type="button"
                  className={r.id === record?.id ? "selected" : ""}
                  aria-pressed={r.id === record?.id}
                  disabled={busy}
                  key={r.id}
                  onClick={() => choose(r)}
                >
                  {(r.draft.image ||
                    r.draft.thumbnail ||
                    r.draft.logo ||
                    r.draft.headshot) && (
                    <img
                      src={
                        r.draft.image ||
                        r.draft.thumbnail ||
                        r.draft.logo ||
                        r.draft.headshot
                      }
                      alt=""
                    />
                  )}
                  <span>
                    <strong>
                      {r.draft.title ||
                        r.draft.name ||
                        r.draft.label ||
                        r.draft.id}
                    </strong>
                    <small className={"cms-state cms-state-" + r.state}>
                      {states[r.state] || r.state} · Revision {r.version}
                    </small>
                  </span>
                </button>
              ))}
              {!shown.length && !busy && <p>No items match this view.</p>}
            </div>
            <div className="cms-editor">
              {!value ? (
                <div className="cms-empty">
                  <h3>{definition.label}</h3>
                  <p>
                    {definition.description ||
                      "Select an item to edit its content and imagery."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="cms-editor-heading">
                    <div>
                      <span>
                        {record ? states[record.state] : "New draft"}
                        {dirty ? " · Unsaved changes" : ""}
                      </span>
                      <h2>
                        {value.title || value.name || value.label || "New item"}
                      </h2>
                    </div>
                    <button type="button" onClick={() => setPreview((v) => !v)}>
                      {preview ? "Edit fields" : "Preview content"}
                    </button>
                  </div>
                  {preview ? (
                    <>
                      <p className="cms-preview-note">
                        Content preview — unpublished changes are visible only
                        here. The website keeps its existing layout.
                      </p>
                      <RecordPreview record={value} collection={collection} />
                    </>
                  ) : (
                    <form
                      ref={form}
                      onInvalidCapture={(e) => {
                        // A collapsed field section must never hide a validation error.
                        let section = e.target.closest("details");
                        while (section) {
                          section.open = true;
                          section = section.parentElement.closest("details");
                        }
                      }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        action("save");
                      }}
                    >
                      {collection === "hero" &&
                        ["schedule", "bangladesh"].includes(value.id) && (
                          <p className="cms-preview-note">
                            This slide uses live{" "}
                            {value.id === "schedule"
                              ? "fixture cards. Edit them in Fixtures & results."
                              : "player cards. Edit their photographs in Players."}
                          </p>
                        )}
                      {!record && collection === "videos" && (
                        <div className="cms-field">
                          <label htmlFor="cms-record-id">
                            YouTube video ID
                          </label>
                          <input
                            id="cms-record-id"
                            required
                            value={value.id}
                            onChange={(e) =>
                              setValue({ ...value, id: e.target.value })
                            }
                          />
                          <small>
                            This becomes a stable reference after the first
                            save.
                          </small>
                        </div>
                      )}
                      <div className="cms-fields">
                        {fields.map((f) => (
                          <div
                            className={
                              [
                                "textarea",
                                "image",
                                "list",
                                "pairs",
                                "strings",
                                "multi",
                              ].includes(f.type)
                                ? "cms-field-wide"
                                : ""
                            }
                            key={f.key}
                          >
                            <ContentField
                              key={f.key}
                              field={f}
                              value={fieldValue(value, f.key)}
                              onChange={(next) => changeField(f, next)}
                              disabled={!writable || busy}
                              api={api}
                            />
                          </div>
                        ))}
                      </div>
                    </form>
                  )}
                  <div className="cms-savebar">
                    {writable && (
                      <button
                        type="button"
                        className="admin-primary"
                        disabled={busy || !dirty || preview}
                        onClick={() => action("save")}
                      >
                        {busy ? "Working…" : "Save draft"}
                      </button>
                    )}
                    {record && writable && record.state === "draft" && (
                      <button
                        type="button"
                        disabled={busy || dirty}
                        onClick={() => action("submit")}
                      >
                        Submit for review
                      </button>
                    )}
                    {record && publisher && record.state === "review" && (
                      <button
                        type="button"
                        disabled={busy || dirty}
                        onClick={() => action("approve")}
                      >
                        Approve revision
                      </button>
                    )}
                    {record && publisher && record.state === "approved" && (
                      <button
                        type="button"
                        className="admin-primary"
                        disabled={busy || dirty}
                        onClick={() => action("publish")}
                      >
                        Publish revision
                      </button>
                    )}
                    <small>
                      {dirty
                        ? "Save changes before review or publication."
                        : record?.published
                          ? "A published version is available."
                          : "Not published yet."}
                    </small>
                  </div>
                  {record && (
                    <details className="cms-history">
                      <summary>History & publishing options</summary>
                      {publisher && record.state === "approved" && (
                        <div className="cms-schedule">
                          <label>
                            Publish at · UAE time
                            <input
                              type="datetime-local"
                              value={schedule}
                              onChange={(e) => setSchedule(e.target.value)}
                            />
                          </label>
                          <button
                            type="button"
                            disabled={!schedule || dirty || busy}
                            onClick={() =>
                              action("schedule", {
                                publishAt: new Date(
                                  schedule + ":00+04:00",
                                ).toISOString(),
                              })
                            }
                          >
                            Schedule publication
                          </button>
                        </div>
                      )}
                      {publisher && !definition.fixed && (
                        <div className="cms-history-actions">
                          <button
                            type="button"
                            disabled={busy || dirty || !record.published}
                            onClick={() => action("unpublish")}
                          >
                            Unpublish
                          </button>
                          <button
                            type="button"
                            disabled={busy || dirty}
                            onClick={() => action("archive")}
                          >
                            Archive
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          run(async () =>
                            setHistory(
                              (
                                await api(
                                  "admin/content/" +
                                    encodeURIComponent(record.id) +
                                    "/revisions",
                                )
                              ).items,
                            ),
                          )
                        }
                      >
                        Load revision history
                      </button>
                      {history?.map((r) => (
                        <details key={r.id}>
                          <summary>
                            Revision {r.version} · {states[r.state]} ·{" "}
                            {new Date(r.created).toLocaleString("en-GB", {
                              timeZone: "Asia/Dubai",
                            })}{" "}
                            UAE
                          </summary>
                          <RecordPreview
                            record={r.payload}
                            collection={collection}
                          />
                          {writable && (
                            <button
                              type="button"
                              disabled={busy || dirty}
                              onClick={() =>
                                action("restore", { revisionId: r.id })
                              }
                            >
                              Restore as draft
                            </button>
                          )}
                        </details>
                      ))}
                    </details>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
