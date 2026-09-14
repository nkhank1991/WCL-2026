import { useEffect, useState } from 'react';
import { accessSections, applicationLink, sectionLabel } from '../../lib/access-sections.mjs';
import './access-settings.css';

export function AccessSections({ zones, selected, onChange }) {
  return <fieldset className="access-section-picker"><legend>Access sections</legend>
    {zones.filter(z => z.code || z.enabled).map(zone => <label key={zone.id} className={selected.includes(zone.id) ? 'is-selected' : ''}>
      <input type="checkbox" disabled={!zone.enabled} checked={selected.includes(zone.id)} onChange={e => onChange(e.target.checked ? [...selected, zone.id] : selected.filter(id => id !== zone.id))} />
      <span className="access-code">{zone.code || '—'}</span><span>{zone.label}<small>{zone.enabled ? zone.code === '5' ? 'Restricted · approval reference required' : 'Available for individual approval' : 'Not enabled by event security'}</small></span>
    </label>)}
  </fieldset>;
}

export function BadgeSections({ zones = [] }) {
  return <div className="badge-section-codes" aria-label="Approved section codes">{accessSections.map(section => <span key={section.id} className={zones.includes(section.id) ? 'granted' : ''} title={sectionLabel(section) + (zones.includes(section.id) ? ' · approved' : ' · not approved')}>{zones.includes(section.id) ? section.code : '—'}</span>)}</div>;
}

export function AccessSettings({ api, onDirtyChange }) {
  const [config, setConfig] = useState(null), [initial, setInitial] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [reviewed, setReviewed] = useState(false);
  const dirty = !!config && JSON.stringify(config) !== initial;
  useEffect(() => { onDirtyChange?.(dirty); return () => onDirtyChange?.(false); }, [dirty, onDirtyChange]);
  async function load() {
    setLoading(true); setError('');
    try { const c = await api('admin/config'); setConfig(c); setInitial(JSON.stringify(c)); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const change = patch => { setConfig(c => ({ ...c, ...patch })); setNotice(''); setReviewed(false); };
  const intake = patch => change({ intake: { ...config.intake, ...patch } });
  const zone = (id, enabled) => change({ zones: config.zones.map(z => z.id === id ? { ...z, enabled } : z) });
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const c = await api('admin/config', { config });
      setConfig(c); setInitial(JSON.stringify(c)); setReviewed(false); setNotice('Settings saved. Existing badges have not been given any new access.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function copy(category) {
    const url = location.origin + applicationLink(category);
    try { await navigator.clipboard.writeText(url); setNotice('Application link copied. It preselects a category, not access permissions.'); }
    catch { setNotice('Copy this application link: ' + url); }
  }
  if (loading) return <p role="status">Loading accreditation settings…</p>;
  if (!config) return <section className="admin-panel"><p role="alert">{error}</p><button onClick={load}>Try again</button></section>;
  return <form className="access-settings" onSubmit={save}>
    <header><div><h2>Applications & access</h2><p>Manage application links and the areas reviewers may assign.</p></div><span className="access-intake-state">{config.intake?.enabled ? 'Applications open' : 'Applications closed'}</span></header>
    {error && <p role="alert" className="admin-error">{error}</p>}
    {notice && <p role="status" className="access-notice">{notice}</p>}
    <fieldset disabled={busy}>
      <section className="admin-panel">
        <h3>01 / Application links</h3><p>Choose the categories available to individual applicants. Every submission enters review with no venue or section access.</p>
        <div className="access-category-links">{config.categories.filter(c => !c.id.startsWith('temporary-')).map(category => <div key={category.id}>
          <label><input type="checkbox" checked={category.acceptApplications !== false} onChange={e => change({ categories: config.categories.map(c => c.id === category.id ? { ...c, acceptApplications: e.target.checked } : c) })} />{category.label}</label>
          <button type="button" aria-label={"Copy link for " + category.label} onClick={() => copy(category.id)}>Copy link</button>
          <a href={applicationLink(category.id)} target="_blank" rel="noreferrer" aria-label={'Preview ' + category.label + ' application'}>Preview ↗</a>
        </div>)}</div>
      </section>
      <section className="admin-panel">
        <h3>02 / Access sections</h3><p>Enable only areas approved by event security. These switches make a section available to reviewers; they do not grant access to anyone.</p>
        <div className="access-section-settings">{config.zones.filter(z => z.code).map(z => <label key={z.id}><span className="access-code">{z.code}</span><span>{z.label}<small>{z.code === '5' ? 'Restricted · explicit approval required for each person' : 'Individually assigned during review'}</small></span><input aria-label={'Enable ' + z.label} type="checkbox" checked={z.enabled === true} onChange={e => zone(z.id, e.target.checked)} /></label>)}</div>
        <details><summary>Other configured areas</summary><p>Legacy areas keep their original IDs. They are not equivalent to the five numbered sections.</p>{config.zones.filter(z => !z.code).map(z => <label className="access-check" key={z.id}><input type="checkbox" checked={z.enabled === true} onChange={e => zone(z.id, e.target.checked)} />{z.label}</label>)}</details>
      </section>
      <section className="admin-panel">
        <h3>03 / Venues</h3><p>Add the exact venue name confirmed by event operations. New venues start disabled.</p>
        {!config.venues.length && <p>No venues added. Applications can be reviewed, but access cannot be approved yet.</p>}
        {config.venues.map(v => <div className="access-venue-row" key={v.id}><label>Venue name<input required maxLength={200} value={v.label} onChange={e => change({ venues: config.venues.map(x => x.id === v.id ? { ...x, label: e.target.value } : x) })} /></label><label className="access-check"><input type="checkbox" checked={v.enabled === true} onChange={e => change({ venues: config.venues.map(x => x.id === v.id ? { ...x, enabled: e.target.checked } : x) })} />Approved for assignment</label></div>)}
        <button type="button" onClick={() => change({ venues: [...config.venues, { id: 'v-' + crypto.randomUUID().slice(0, 18), label: '', enabled: false }] })}>Add venue</button>
      </section>
      <section className="admin-panel">
        <h3>04 / Open applications</h3>
        <div className="access-field-grid">
          <label>Season year<input required inputMode="numeric" pattern="[0-9]{4}" value={config.season} onChange={e => change({ season: e.target.value })} /></label>
          <label>Support email<input type="email" value={config.intake?.contactEmail || ''} onChange={e => intake({ contactEmail: e.target.value })} required={config.intake?.enabled} /></label>
          <label>Approved privacy-notice URL<input type="url" placeholder="https://" value={config.intake?.privacyNoticeUrl || ''} onChange={e => intake({ privacyNoticeUrl: e.target.value })} required={config.intake?.enabled} /></label>
          <label>Consent version<input placeholder="Version approved by WCL" value={config.intake?.consentVersion || ''} onChange={e => intake({ consentVersion: e.target.value })} required={config.intake?.enabled} /></label>
        </div>
        <label className="access-check"><input type="checkbox" checked={config.intake?.enabled === true} onChange={e => intake({ enabled: e.target.checked })} />Accept individual applications</label>
        <p>Opening the form requires an approved HTTPS privacy notice, support email and consent version. It does not issue credentials.</p>
      </section>
      <details className="admin-panel"><summary>Badge layout & category colours</summary><div className="access-field-grid">
        <label>Width · mm<input type="number" min={50} max={150} required value={config.widthMm} onChange={e => change({ widthMm: Number(e.target.value) })} /></label>
        <label>Height · mm<input type="number" min={70} max={220} required value={config.heightMm} onChange={e => change({ heightMm: Number(e.target.value) })} /></label>
      </div><label>Back-of-badge conditions<textarea rows={4} maxLength={3000} value={config.backText} onChange={e => change({ backText: e.target.value })} /></label>
        <div className="access-colours">{config.categories.map(c => <label key={c.id}><input type="color" value={c.color} onChange={e => change({ categories: config.categories.map(x => x.id === c.id ? { ...x, color: e.target.value } : x) })} />{c.label}</label>)}</div>
        <p>The five slots display approved codes only. Printer dimensions and final artwork still require sign-off.</p><BadgeSections />
      </details>
      <footer><label className="access-check"><input type="checkbox" required checked={reviewed} onChange={e => setReviewed(e.target.checked)} />I have checked these settings and have authority to make these changes.</label><button type="submit" className="admin-primary" disabled={!dirty || !reviewed}>{busy ? 'Saving…' : 'Save settings'}</button>{dirty && <small>Unsaved changes</small>}</footer>
    </fieldset>
  </form>;
}
