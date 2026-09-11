import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight, ArrowUpRight, Check, EnvelopeSimple} from '@phosphor-icons/react';

const topics = ['General enquiry', 'Tickets & matchday', 'Media & press', 'Partnerships', 'Privacy request'];
let turnstilePromise;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!turnstilePromise) turnstilePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true;
    const timer = setTimeout(() => { script.remove(); reject(new Error('Verification unavailable')); }, 12000);
    script.onload = () => { clearTimeout(timer); window.turnstile ? resolve(window.turnstile) : reject(new Error('Verification unavailable')); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Verification unavailable')); };
    document.head.append(script);
  }).catch(error => { turnstilePromise = null; throw error; });
  return turnstilePromise;
}

function Verification({siteKey, attempt, onToken}) {
  const host = useRef(null); const [failed, setFailed] = useState(false); const [size, setSize] = useState('compact');
  useEffect(() => {
    const measure = () => setSize(host.current?.clientWidth >= 300 ? 'flexible' : 'compact');
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (host.current) observer?.observe(host.current);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  useEffect(() => {
    let active = true; let widget; setFailed(false); onToken('');
    loadTurnstile().then(api => {
      if (!active) return;
      widget = api.render(host.current, {sitekey: siteKey, theme: 'dark', size, action: 'contact',
        callback: token => { if (active) onToken(token); },
        'expired-callback': () => { if (active) onToken(''); },
        'error-callback': () => { if (active) { onToken(''); setFailed(true); } },
      });
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; if (widget !== undefined) window.turnstile?.remove(widget); };
  }, [siteKey, attempt, onToken, size]);
  return <div className="contact-verification"><div ref={host}/>{failed && <p role="alert">Security verification could not load. Please retry the check below or email us directly.</p>}</div>;
}

export function ContactPage() {
  const [config, setConfig] = useState(null), [status, setStatus] = useState('idle'), [error, setError] = useState(''), [errors, setErrors] = useState({});
  const [token, setToken] = useState(''), [attempt, setAttempt] = useState(0), [reference, setReference] = useState('');
  const form = useRef(null), feedback = useRef(null), requestId = useRef(null), busy = useRef(false);
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch('/api/contact', {signal: controller.signal, headers: {Accept: 'application/json'}}).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(value => { if (active) setConfig(value); }).catch(() => { if (active) setConfig({available: false}); }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, []);
  useEffect(() => { if (status === 'success' || error) feedback.current?.focus(); }, [status, error]);
  async function submit(event) {
    event.preventDefault(); if (busy.current) return;
    setError(''); setErrors({});
    if (!config?.available) { setError('Online enquiries are unavailable right now. Please email info@wclcricket.com.'); return; }
    if (!token) { setError('Complete the security check before sending your message.'); return; }
    const values = Object.fromEntries(new FormData(form.current));
    requestId.current ||= crypto.randomUUID();
    busy.current = true; setStatus('sending');
    try {
      const response = await fetch('/api/contact', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...values, privacy: values.privacy === 'on', token, requestId: requestId.current}), signal: AbortSignal.timeout(25000)});
      const result = await response.json();
      if (!response.ok || !result.ok) { setErrors(result.fields || {}); throw new Error(result.error || 'Your enquiry could not be confirmed. Please retry or email us.'); }
      setReference(result.reference); setStatus('success');
    } catch (e) { setStatus('idle'); setError(e.name === 'TimeoutError' || e instanceof TypeError ? 'We could not confirm your enquiry. Retry without changing your message, or email us directly.' : e.message); }
    finally { busy.current = false; setToken(''); setAttempt(v => v + 1); }
  }
  function FieldError({name}) { return errors[name] ? <span id={`error-${name}`} className="contact-field-error">{errors[name]}</span> : null; }
  const props = name => ({'aria-labelledby': `contact-label-${name}`, 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `error-${name}` : undefined});
  return <>
    <div className="page-title"><div className="wrap"><p className="kicker">GET IN TOUCH</p><h1>Let’s talk cricket.</h1><p>Questions, ideas or a place in the next chapter. We’d like to hear from you.</p></div></div>
    <section className="wrap contact-layout">
      <aside className="contact-intro"><EnvelopeSimple size={28}/><h2>A direct line to WCL.</h2><p>For matchday questions, media enquiries, partnerships and everything in between.</p><a className="contact-email" href="mailto:info@wclcricket.com">info@wclcricket.com <ArrowUpRight size={18}/></a><div className="contact-shortcuts"><Link to="/faq">Quick answers <ArrowRight size={16}/></Link><Link to="/tickets">Tickets & venue information <ArrowRight size={16}/></Link><Link to="/privacy">How we handle your information <ArrowRight size={16}/></Link></div><p className="contact-small">Please don’t include payment details, passwords or identity documents in your message.</p></aside>
      <div className="contact-panel">
        {status === 'success' ? <div className="contact-success" ref={feedback} tabIndex={-1} role="status"><span className="contact-success-icon"><Check size={28}/></span><p className="kicker">THANK YOU FOR REACHING OUT</p><h2>Your enquiry is on its way.</h2><p>It has been accepted for delivery to info@wclcricket.com. The WCL team can reply to the email address you provided.</p><p className="contact-reference">Reference: {reference}</p><button className="btn" onClick={() => {setStatus('idle'); requestId.current = null;}}>Send another enquiry <ArrowRight/></button></div> : <form ref={form} onSubmit={submit} aria-label="Contact WCL" aria-busy={status === 'sending'}>
          <div className="contact-form-heading"><h2>Send an enquiry</h2><p>All fields are required.</p></div>
          {config === null ? <p className="contact-service-note" role="status">Checking online enquiries…</p> : !config.available && <p className="contact-service-note" role="status">Online enquiries are not available at the moment. You can reach us directly at <a href="mailto:info@wclcricket.com">info@wclcricket.com</a>.</p>}
          <fieldset disabled={status === 'sending'}><div className="contact-fields"><label><span id="contact-label-name">Your name</span><input name="name" autoComplete="name" required minLength={2} maxLength={100} {...props('name')}/><FieldError name="name"/></label><label><span id="contact-label-email">Email address</span><input name="email" type="email" autoComplete="email" required maxLength={254} {...props('email')}/><FieldError name="email"/></label></div>
          <label><span id="contact-label-topic">What’s your enquiry about?</span><select name="topic" defaultValue="" required {...props('topic')}><option value="" disabled>Select a topic</option>{topics.map(t => <option key={t}>{t}</option>)}</select><FieldError name="topic"/></label>
          <label><span id="contact-label-message">Your message</span><textarea name="message" rows={5} required minLength={10} maxLength={5000} placeholder="Tell us how we can help…" {...props('message')}/><FieldError name="message"/></label>
          <div className="contact-trap" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
          <label className="contact-consent"><input type="checkbox" name="privacy" required {...props('privacy')}/><span id="contact-label-privacy">I have read the <Link to="/privacy" target="_blank" rel="noopener">Privacy Policy</Link> and understand how my enquiry will be handled. This does not subscribe me to marketing.</span></label><FieldError name="privacy"/>
          </fieldset>
          {config?.available && <><Verification siteKey={config.siteKey} attempt={attempt} onToken={setToken}/><button type="button" className="contact-retry" disabled={status === 'sending'} onClick={() => {setToken(''); setAttempt(v => v + 1);}}>Retry security check</button></>}
          {error && <p ref={feedback} tabIndex={-1} role="alert" className="contact-error">{error}</p>}
          <div className="contact-submit"><button className="btn" type="submit" disabled={!config?.available || status === 'sending'}>{status === 'sending' ? 'Sending enquiry…' : 'Send enquiry'}<ArrowRight size={18}/></button><span>Or <a href="mailto:info@wclcricket.com">email us directly <ArrowUpRight size={13}/></a></span></div>
          {config?.available && <p className="contact-small">Protected by Cloudflare Turnstile. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Privacy</a> · <a href="https://www.cloudflare.com/website-terms/" target="_blank" rel="noreferrer">Terms</a></p>}
        </form>}
      </div>
    </section>
  </>;
}
