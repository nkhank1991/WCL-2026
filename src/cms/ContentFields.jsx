import { usePublished } from "../PublishedContent.jsx";
import { useId, useRef, useState } from "react";
import { fieldValue, setField } from "./schema.js";

function ImagePicker({ value, onChange, label, disabled, api }) {
  const dialog = useRef(null),
    [images, setImages] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null),
    [credit, setCredit] = useState(""),
    [rights, setRights] = useState(false);
  async function open() {
    setError("");
    setLoading(true);
    dialog.current.showModal();
    try {
      setImages((await api("admin/media")).items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  async function upload() {
    if (!file || !credit.trim() || !rights) {
      setError(
        "Choose an image, add its credit and confirm permission to use it.",
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Choose a PNG, JPEG or WebP below 2 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await api("admin/media", {
        name: file.name,
        base64,
        visibility: "public-reviewed",
        credit,
        rightsConfirmed: true,
      });
      onChange(result.url);
      dialog.current.close();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="cms-image-field">
      {value ? (
        <img src={value} alt={label + " preview"} />
      ) : (
        <div className="cms-image-empty">No image selected</div>
      )}
      <button type="button" disabled={disabled} onClick={open}>
        {value ? "Replace image" : "Choose image"}
      </button>
      <details>
        <summary>Image address</summary>
        <input
          aria-label={label + " address"}
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        <small>
          Choose from the library, upload an image, or paste an approved image
          address.
        </small>
      </details>
      <dialog
        ref={dialog}
        className="cms-media-dialog"
        aria-label={"Choose " + label}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current.close();
        }}
      >
        <div className="cms-dialog-heading">
          <h2>Choose an image</h2>
          <button
            type="button"
            onClick={() => dialog.current.close()}
            aria-label="Close image library"
          >
            Close
          </button>
        </div>
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        {loading && <p role="status">Loading the image library…</p>}
        {!loading && !error && !images.length && (
          <p>No uploaded images yet. Add an approved image below.</p>
        )}
        <div className="cms-library" aria-busy={loading}>
          {images.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                onChange("/api/public/media/" + item.id);
                dialog.current.close();
              }}
            >
              <img src={"/api/public/media/" + item.id} alt="" />
              <span>{item.name}</span>
            </button>
          ))}
          {!images.length && (
            <p>
              No uploaded images yet. Your current website images are preserved.
            </p>
          )}
        </div>
        <div className="cms-upload">
          <h3>Upload a new image</h3>
          <label>
            Image · PNG, JPEG or WebP · maximum 2 MB
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
          <label>
            Source or photographer credit
            <input value={credit} onChange={(e) => setCredit(e.target.value)} />
          </label>
          <label className="cms-checkbox">
            <input
              type="checkbox"
              checked={rights}
              onChange={(e) => setRights(e.target.checked)}
            />
            I have permission to publish this image.
          </label>
          <button
            type="button"
            className="admin-primary"
            onClick={upload}
            disabled={busy}
          >
            {busy ? "Uploading…" : "Upload and use image"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
function RecordChoice({ field, value, onChange, disabled }) {
  const rows = usePublished(field.collection, []),
    id = useId();
  return (
    <div className="cms-field">
      <label htmlFor={id}>{field.label}</label>
      <select
        id={id}
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Choose a published match</option>
        {rows.map((row) => (
          <option key={row.id} value={row.id}>
            {row.label} · {row.teams?.join(" × ")} · {row.date}
          </option>
        ))}
      </select>
    </div>
  );
}
export function ContentField({
  field: f,
  value,
  onChange,
  disabled = false,
  api,
}) {
  const id = useId();
  if (f.type === "record")
    return (
      <RecordChoice
        field={f}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (f.type === "image")
    return (
      <fieldset className="cms-field">
        <legend>{f.label}</legend>
        <ImagePicker
          label={f.label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          api={api}
        />
      </fieldset>
    );
  if (f.type === "boolean")
    return (
      <label className="cms-checkbox">
        <input
          type="checkbox"
          checked={!!value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        {f.label}
      </label>
    );
  if (f.type === "multi")
    return (
      <fieldset className="cms-field">
        <legend>{f.label}</legend>
        <div className="cms-options">
          {f.options.map((option) => (
            <label key={option} className="cms-checkbox">
              <input
                type="checkbox"
                disabled={disabled}
                checked={(value || []).includes(option)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...(value || []), option]
                      : (value || []).filter((x) => x !== option),
                  )
                }
              />
              {option.replaceAll("-", " ")}
            </label>
          ))}
        </div>
      </fieldset>
    );
  if (["list", "pairs", "strings"].includes(f.type)) {
    const items = Array.isArray(value) ? value : [];
    const replace = (i, next) =>
      onChange(items.map((row, index) => (index === i ? next : row)));
    const reorder = (i, step) => {
      const next = [...items];
      [next[i], next[i + step]] = [next[i + step], next[i]];
      onChange(next);
    };
    return (
      <fieldset className="cms-field cms-repeater">
        <legend>{f.label}</legend>
        {items.map((row, i) => (
          <div className="cms-repeat-row" key={i}>
            <div className="cms-repeat-top">
              <strong>
                {f.type === "pairs" ? "Fact" : f.label.replace(/s$/, "")}{" "}
                {i + 1}
              </strong>
              <div>
                <button
                  type="button"
                  aria-label={"Move " + f.label + " " + (i + 1) + " up"}
                  disabled={disabled || i === 0}
                  onClick={() => reorder(i, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={"Move " + f.label + " " + (i + 1) + " down"}
                  disabled={disabled || i === items.length - 1}
                  onClick={() => reorder(i, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onChange(items.filter((_, index) => index !== i))
                  }
                >
                  Remove
                </button>
              </div>
            </div>
            {f.type === "list" ? (
              f.fields.map((child) => (
                <ContentField
                  key={child.key}
                  field={child}
                  value={fieldValue(row, child.key)}
                  onChange={(v) => replace(i, setField(row, child.key, v))}
                  disabled={disabled}
                  api={api}
                />
              ))
            ) : f.type === "pairs" ? (
              <div className="cms-two-fields">
                <label>
                  Value
                  <input
                    value={row[0]}
                    disabled={disabled}
                    maxLength={300}
                    onChange={(e) => replace(i, [e.target.value, row[1]])}
                  />
                </label>
                <label>
                  Label
                  <input
                    value={row[1]}
                    disabled={disabled}
                    maxLength={300}
                    onChange={(e) => replace(i, [row[0], e.target.value])}
                  />
                </label>
              </div>
            ) : (
              <input
                aria-label={f.label + " " + (i + 1)}
                value={row}
                disabled={disabled}
                onChange={(e) => replace(i, e.target.value)}
              />
            )}
          </div>
        ))}
        <button
          type="button"
          disabled={disabled || items.length >= (f.max || 40)}
          onClick={() =>
            onChange([
              ...items,
              f.type === "list" ? {} : f.type === "pairs" ? ["", ""] : "",
            ])
          }
        >
          Add{" "}
          {f.type === "pairs"
            ? "fact"
            : f.type === "strings"
              ? "entry"
              : "item"}
        </button>
      </fieldset>
    );
  }
  const common = {
    id,
    disabled,
    maxLength: f.maxLength || (f.type === "textarea" ? 20000 : 2000),
  };
  let control;
  if (f.type === "select")
    control = (
      <select
        {...common}
        value={value ?? ""}
        onChange={(e) =>
          onChange(f.numeric ? Number(e.target.value) : e.target.value)
        }
      >
        <option value="">Not specified</option>
        {f.options.map((option) => (
          <option key={option} value={option}>
            {option ? option.replaceAll("-", " ") : "None"}
          </option>
        ))}
      </select>
    );
  else if (f.type === "textarea")
    control = (
      <textarea
        {...common}
        rows={5}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  else if (f.type === "datetime")
    control = (
      <input
        {...common}
        type="datetime-local"
        value={
          value
            ? new Date(Date.parse(value) + 4 * 3600000)
                .toISOString()
                .slice(0, 16)
            : ""
        }
        onChange={(e) =>
          onChange(
            e.target.value
              ? new Date(e.target.value + ":00+04:00").toISOString()
              : "",
          )
        }
      />
    );
  else
    control = (
      <input
        {...common}
        type={
          ["number", "date", "color", "email"].includes(f.type)
            ? f.type
            : "text"
        }
        value={
          f.type === "date" ? String(value || "").slice(0, 10) : (value ?? "")
        }
        min={f.min}
        max={f.max}
        step={f.step || (f.type === "number" ? "any" : undefined)}
        onChange={(e) => {
          let next = e.target.value;
          if (f.type === "number") next = next === "" ? "" : Number(next);
          if (f.type === "youtube") {
            try {
              const url = new URL(next);
              next =
                url.hostname === "youtu.be"
                  ? url.pathname.slice(1)
                  : url.searchParams.get("v") || url.pathname.split("/").at(-1);
            } catch {}
          }
          onChange(next);
        }}
      />
    );
  return (
    <div className="cms-field">
      <label htmlFor={id}>
        {f.label}
        {f.type === "datetime" && " · UAE time (UTC+4)"}
      </label>
      {control}
      {f.type === "textarea" && (
        <small>
          Separate paragraphs with a blank line. Links: [label](https://…).
          Lists: start a line with “- ”.
        </small>
      )}
    </div>
  );
}
