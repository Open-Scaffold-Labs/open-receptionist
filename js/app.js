import {architectureLayers, receptionistPresets, smsTemplates, outboundCampaignTemplates} from './data.js';
import {THEMES, applyTheme, loadSavedTheme, listThemes} from './theme.js';
import {
  money,
  escapeHTML as e,
  createState,
  audit,
  calculateReceptionistSavings,
  simulateInboundVoiceCall,
  simulateOutboundVoiceCall,
  triggerMissedCallTextBack,
  saveState,
  loadState
} from './engine.js';

const $ = selector => document.querySelector(selector);
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = {getItem: () => null, setItem: () => { throw new Error('Storage disabled'); }};
}

let state = loadState(storage);
let theme = loadSavedTheme(document.documentElement, storage);
let toastTimer;

const tabs = [
  ['cockpit', '◫', 'Bidirectional Voice Overview'],
  ['inbound-voice', '↙', 'Inbound Call Answering'],
  ['outbound-voice', '↗', 'Outbound Voice Dialer'],
  ['sms-textback', '💬', 'Two-Way SMS Inbox'],
  ['direct-booking', '📅', 'Appointments & Outcomes'],
  ['sip-carrier', '☎', 'Phone Lines & SIP Devices']
];

const badge = (text, type = 'neutral') => `<span class="badge ${type}">${e(text)}</span>`;
const button = (text, action, classes = '', attrs = '') =>
  `<button type="button" class="btn ${classes}" data-action="${action}" ${attrs}>${e(text)}</button>`;

function persist() {
  if (!saveState(state, storage)) {
    notify('Browser storage is unavailable. Changes will last for this session.');
  }
}

function notify(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}

function activeTab() {
  const raw = location.hash.replace('#tab-', '');
  return tabs.some(t => t[0] === raw) ? raw : 'cockpit';
}

function setTheme(name) {
  theme = applyTheme(name, document.documentElement, storage);
  const picker = $('#top-theme-picker');
  if (picker) picker.value = theme;
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.theme === theme));
  });
}

function renderHeader() {
  const presetPicker = $('#preset-picker');
  if (presetPicker) {
    presetPicker.innerHTML = receptionistPresets
      .map(p => `<option value="${p.id}">${e(p.vertical)} · ${e(p.business)} (${e(p.phoneNumber)})</option>`)
      .join('');
    presetPicker.value = state.activePresetId;
  }
  const themePicker = $('#top-theme-picker');
  if (themePicker) {
    themePicker.innerHTML = listThemes()
      .map(t => `<option value="${t.key}">${e(t.label)}</option>`)
      .join('');
  }
  const pills = $('#theme-pills');
  if (pills) {
    pills.innerHTML = listThemes()
      .map(t => `<button type="button" style="background:${THEMES[t.key].vars['--os-accent']}" title="${e(t.label)}" aria-label="${e(t.label)}" aria-pressed="${theme === t.key}" data-theme="${t.key}"></button>`)
      .join('');
  }
  setTheme(theme);
}

function renderNav() {
  const nav = $('#navigation');
  if (!nav) return;
  const current = activeTab();
  nav.innerHTML = tabs
    .map(([id, icon, label]) => `<a href="#tab-${id}" class="nav-link ${current === id ? 'active' : ''}" aria-current="${current === id ? 'page' : 'false'}"><span class="nav-icon" aria-hidden="true">${icon}</span><span>${e(label)}</span></a>`)
    .join('');
}

function pageTop(eyebrow, title, description, action = '') {
  return `<div class="page-top"><div><span class="eyebrow">${e(eyebrow)}</span><h1>${e(title)}</h1><p>${e(description)}</p></div>${action}</div>`;
}

function selectPreset(presetId) {
  const preset = receptionistPresets.find(p => p.id === presetId) || receptionistPresets[0];
  state.activePresetId = preset.id;
  state.voiceCall.callerName = preset.sampleCallerName;
  state.voiceCall.callerPhone = preset.sampleCallerPhone;
  state.voiceCall.callerBadge = preset.sampleCallerBadge;
  state.voiceCall.intent = preset.sampleIntent;
  state.voiceCall.depositAmount = preset.depositAmount;
  state.outboundCall.targetName = preset.outboundTargetName;
  state.outboundCall.targetPhone = preset.outboundTargetPhone;
  state.outboundCall.campaignType = preset.outboundCampaignType;
  state.outboundCall.script = preset.outboundScript;
  state.outboundCall.expectedOutcome = preset.outboundOutcome;
  audit(state, `Switched active Open Scaffold Voice preset to ${preset.vertical} (${preset.business})`);
  persist();
  render();
  notify(`Loaded ${preset.vertical} bidirectional voice profile: ${preset.business}`);
}

function renderCockpit() {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];
  const outboundLogs = state.outboundLogs || [];

  return `
    ${pageTop(
      'OPEN SCAFFOLD VOICE · @OPENSCAFFOLD/VOICE BIDIRECTIONAL MODULE',
      `${preset.business} — Inbound & Outbound Voice Console (${preset.phoneNumber})`,
      'Manage incoming customer calls, outgoing confirmation/recall/vendor calls, two-way SMS threads, and synced schedule actions.',
      `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">${button('↙ Answer Inbound Call', 'simulate-call', 'primary')}${button('↗ Place Outbound Call', 'simulate-outbound-call', '')}</div>`
    )}
    <div class="kpi-grid">
      <article class="kpi-card">
        <span class="eyebrow">ACTIVE BIDIRECTIONAL LINE</span>
        <strong class="kpi-value">${e(preset.phoneNumber)}</strong>
        <p>${e(preset.business)} · Inbound &amp; Outbound SIP Online</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">INBOUND CALLS ANSWERED</span>
        <strong class="kpi-value">${state.callLogs.length}</strong>
        <p>${state.voiceCall.latencyMs}ms AI response · 1st-ring answer</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">OUTBOUND CALLS COMPLETED</span>
        <strong class="kpi-value">${outboundLogs.length}</strong>
        <p>Confirmations, recalls &amp; vendor dispatch</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">SCHEDULED OUTCOMES &amp; SMS</span>
        <strong class="kpi-value">${state.bookings.length} / ${state.smsThreads.length}</strong>
        <p>Bookings confirmed · SMS threads delivered</p>
      </article>
    </div>

    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">INBOUND DIRECTION (↙ INCOMING CALLS)</span>
            <h2>Live Inbound Queue &amp; Screen-Pop</h2>
          </div>
          ${badge('1st-Ring Auto-Answer', 'positive')}
        </div>
        ${state.callLogs.length === 0 ? `
          <div class="callout" style="margin-bottom:1rem">
            <strong>Next Inbound Caller on ${e(preset.phoneNumber)}: ${e(state.voiceCall.callerName)} (${e(state.voiceCall.callerPhone)})</strong>
            <p><strong>CRM Match:</strong> ${e(state.voiceCall.callerBadge)}</p>
            <p><strong>Caller Intent:</strong> “${e(state.voiceCall.intent)}”</p>
          </div>
          ${button('↙ Answer Inbound Call & Book Slot', 'simulate-call', 'primary')}
        ` : `
          <table class="data-table">
            <thead>
              <tr><th>Call ID</th><th>Caller</th><th>Booked Action</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.callLogs.map(c => `
                <tr>
                  <td class="mono"><strong>${e(c.id)}</strong></td>
                  <td><strong>${e(c.callerName)}</strong><br><small>${e(c.callerPhone)}</small></td>
                  <td>${e(c.intent)}</td>
                  <td>${badge(c.status, 'positive')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">OUTBOUND DIRECTION (↗ OUTGOING CALLS)</span>
            <h2>Proactive Outbound Voice Queue</h2>
          </div>
          ${badge('Outbound Dialer Ready', 'info')}
        </div>
        ${outboundLogs.length === 0 ? `
          <div class="callout" style="margin-bottom:1rem">
            <strong>Next Queued Outbound Call: ${e(state.outboundCall.targetName)} (${e(state.outboundCall.targetPhone)})</strong>
            <p><strong>Workflow:</strong> ${e(state.outboundCall.campaignType)}</p>
            <p><strong>Spoken Prompt:</strong> “${e(state.outboundCall.script)}”</p>
          </div>
          ${button('↗ Place Outbound Call Now', 'simulate-outbound-call', 'primary')}
        ` : `
          <table class="data-table">
            <thead>
              <tr><th>Call ID</th><th>Recipient</th><th>Workflow &amp; Outcome</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${outboundLogs.map(o => `
                <tr>
                  <td class="mono"><strong>${e(o.id)}</strong></td>
                  <td><strong>${e(o.targetName)}</strong><br><small>${e(o.targetPhone)}</small></td>
                  <td><strong>${e(o.campaignType)}</strong><br><small>${e(o.outcome)}</small></td>
                  <td>${badge(o.status, 'positive')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </section>
    </div>
  `;
}

function renderInboundVoice() {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];
  return `
    ${pageTop(
      `INBOUND VOICE ENGINE (↙) · ${preset.vertical.toUpperCase()}`,
      `${preset.business} · Inbound Caller-ID Screen-Pop & Schedule Routing`,
      'Configure how incoming phone calls are greeted, matched to customer records, and routed or booked onto the live schedule.',
      button('↙ Answer Inbound Call & Book Slot', 'simulate-call', 'primary')
    )}
    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">INBOUND CALL ROUTING &amp; @OPENSCAFFOLD/CRM SCREEN-POP</span>
            <h2>Incoming Line: ${e(preset.phoneNumber)}</h2>
          </div>
          ${badge(`${state.voiceCall.latencyMs}ms Voice Latency`, 'positive')}
        </div>
        <div class="callout" style="margin-bottom:1rem">
          <strong>Spoken Inbound Greeting:</strong>
          <p>“${e(preset.greeting)}”</p>
        </div>
        <div class="form-grid">
          <label>Caller Name (@openscaffold/crm Match)
            <input type="text" value="${e(state.voiceCall.callerName)}" data-voice="callerName">
          </label>
          <label>Caller Mobile Number (10DLC SMS Target)
            <input type="text" value="${e(state.voiceCall.callerPhone)}" data-voice="callerPhone">
          </label>
          <label>CRM Profile Badge
            <input type="text" value="${e(state.voiceCall.callerBadge)}" data-voice="callerBadge">
          </label>
          <label>Deposit / Payment Link Amount ($)
            <input type="number" step="5" value="${state.voiceCall.depositAmount}" data-voice="depositAmount">
          </label>
        </div>
        <label style="display:block;margin-top:0.75rem">Spoken Caller Intent &amp; Schedule Action
          <input type="text" value="${e(state.voiceCall.intent)}" data-voice="intent" style="width:100%">
        </label>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">INBOUND CALL LOG</span>
            <h2>Answered Inbound Calls (${state.callLogs.length})</h2>
          </div>
          ${badge('Inbound Active', 'positive')}
        </div>
        ${state.callLogs.length === 0 ? `<p>Click <strong>↙ Answer Inbound Call &amp; Book Slot</strong> to process an incoming call on ${e(preset.phoneNumber)}.</p>` : `
          <table class="data-table">
            <thead>
              <tr><th>Call ID</th><th>Caller &amp; Profile</th><th>Booked Action</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.callLogs.map(c => `
                <tr>
                  <td class="mono"><strong>${e(c.id)}</strong><br><small>${c.latencyMs}ms latency</small></td>
                  <td><strong>${e(c.callerName)}</strong> (${e(c.callerPhone)})<br><small>${e(c.callerBadge)}</small></td>
                  <td>${e(c.intent)}<br><small>Booking ${e(c.bookingId)} · Deposit ${money(c.depositAmount)}</small></td>
                  <td>${badge(c.status, 'positive')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </section>
    </div>
  `;
}

function renderOutboundVoice() {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];
  const outboundLogs = state.outboundLogs || [];
  return `
    ${pageTop(
      `OUTBOUND VOICE DIALER & CAMPAIGNS (↗) · ${preset.vertical.toUpperCase()}`,
      `${preset.business} · Proactive Outbound Calling & Follow-Up Workflows`,
      'Place single or batch outbound AI voice calls for appointment confirmations, 6-month recalls, waitlist backfill, vendor/crew dispatch, and past-due payment follow-ups.',
      button('↗ Place Outbound Call Now', 'simulate-outbound-call', 'primary')
    )}
    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">OUTBOUND CALL DISPATCHER (FROM ${e(preset.phoneNumber)})</span>
            <h2>Configure Outgoing Voice Call</h2>
          </div>
          ${badge('Caller-ID Verified CNAM', 'info')}
        </div>
        <div class="form-grid">
          <label>Recipient Name / Organization
            <input type="text" value="${e(state.outboundCall.targetName)}" data-outbound="targetName">
          </label>
          <label>Recipient Phone Number
            <input type="text" value="${e(state.outboundCall.targetPhone)}" data-outbound="targetPhone">
          </label>
          <label style="grid-column:1 / -1">Outbound Workflow / Purpose
            <input type="text" value="${e(state.outboundCall.campaignType)}" data-outbound="campaignType" style="width:100%">
          </label>
          <label style="grid-column:1 / -1">Spoken Outbound Script &amp; Interactive Prompt
            <input type="text" value="${e(state.outboundCall.script)}" data-outbound="script" style="width:100%">
          </label>
          <label style="grid-column:1 / -1">Expected Call Resolution / Schedule Update
            <input type="text" value="${e(state.outboundCall.expectedOutcome)}" data-outbound="expectedOutcome" style="width:100%">
          </label>
        </div>
        <div style="margin-top:1rem">
          ${button('↗ Dial Outbound Call & Sync Outcome', 'simulate-outbound-call', 'primary')}
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">COMPLETED OUTBOUND CALLS</span>
            <h2>Outbound Call &amp; Outcome Log (${outboundLogs.length})</h2>
          </div>
          ${badge('Bidirectional Sync', 'positive')}
        </div>
        ${outboundLogs.length === 0 ? `
          <p style="margin-bottom:1rem">No outbound calls placed in this session yet. Click <strong>↗ Place Outbound Call Now</strong> or trigger one of the standard vertical outbound workflows below:</p>
          <table class="data-table">
            <thead>
              <tr><th>Outbound Workflow</th><th>Trigger</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${outboundCampaignTemplates.map(t => `
                <tr>
                  <td><strong>${e(t.name)}</strong><br><small>${e(t.description)}</small></td>
                  <td><small>${e(t.trigger)}</small></td>
                  <td>${button('Run Call', 'simulate-outbound-call', '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <table class="data-table">
            <thead>
              <tr><th>Call ID</th><th>Recipient</th><th>Workflow &amp; Spoken Script</th><th>Recorded Outcome</th></tr>
            </thead>
            <tbody>
              ${outboundLogs.map(o => `
                <tr>
                  <td class="mono"><strong>${e(o.id)}</strong><br><small>From ${e(o.fromLine)}</small></td>
                  <td><strong>${e(o.targetName)}</strong><br><small>${e(o.targetPhone)}</small></td>
                  <td><strong>${e(o.campaignType)}</strong><br><small>“${e(o.script)}”</small></td>
                  <td>${badge(o.outcome, 'positive')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </section>
    </div>
  `;
}

function renderSmsTextback() {
  return `
    ${pageTop(
      'TWO-WAY SMS INBOX & AUTOMATED TEXT TEMPLATES',
      'Missed-Call Text-Back, Appointment Confirmations & Outbound Follow-Ups',
      'Send and receive customer text messages, dispatch instant missed-call text-backs, and send appointment deposit and confirmation links.'
    )}
    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">AUTOMATED 10DLC SMS WORKFLOWS</span>
            <h2>1-Click SMS Templates</h2>
          </div>
          ${badge('10DLC Registered', 'positive')}
        </div>
        <table class="data-table">
          <thead>
            <tr><th>Template &amp; Trigger</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${smsTemplates.map(t => `
              <tr>
                <td><strong>${e(t.name)}</strong><br><small>Trigger: ${e(t.trigger)}</small><br><small style="color:var(--os-ink-muted)">“${e(t.bodyTemplate)}”</small></td>
                <td>${button('Send SMS', 'send-sms', 'primary', `data-tpl="${e(t.id)}"`)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">LIVE TWO-WAY 10DLC MESSAGE STREAM</span>
            <h2>Sent &amp; Triggered SMS Threads (${state.smsThreads.length})</h2>
          </div>
          ${badge('Instant Delivery', 'positive')}
        </div>
        ${state.smsThreads.length === 0 ? `<p>Click any <strong>Send SMS</strong> button on the left or process an inbound/outbound call to populate the live two-way SMS stream.</p>` : `
          <table class="data-table">
            <thead>
              <tr><th>Msg ID</th><th>Recipient</th><th>Message Body</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.smsThreads.map(m => `
                <tr>
                  <td class="mono"><strong>${e(m.id)}</strong></td>
                  <td><strong>${e(m.recipientName)}</strong><br><small>${e(m.to)}</small></td>
                  <td><small>${e(m.body)}</small></td>
                  <td>${badge(m.status, 'positive')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </section>
    </div>
  `;
}

function renderDirectBooking() {
  return `
    ${pageTop(
      'APPOINTMENTS, RESERVATIONS & CALL OUTCOMES',
      'Scheduled Bookings & Confirmed Call Actions',
      'Review appointments, reservations, and dispatch actions confirmed via inbound or outbound voice calls and SMS.'
    )}
    <section class="card">
      <div class="card-head">
        <div>
          <span class="eyebrow">@OPENSCAFFOLD/SCHEDULE LEDGER</span>
          <h2>Confirmed Appointments &amp; Outbound Call Outcomes (${state.bookings.length})</h2>
        </div>
        ${badge('Synced to Schedule & CRM', 'positive')}
      </div>
      ${state.bookings.length === 0 ? `<p>No bookings recorded yet in this session. Answer an inbound call or place an outbound call to record a live schedule action.</p>` : `
        <table class="data-table">
          <thead>
            <tr><th>Booking ID</th><th>Direction</th><th>Customer / Target</th><th>Summary</th><th>Deposit / Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${state.bookings.map(b => `
              <tr>
                <td class="mono"><strong>${e(b.id)}</strong><br><small>Call ${e(b.callId)}</small></td>
                <td>${badge(b.direction || 'INBOUND', b.direction === 'OUTBOUND' ? 'info' : 'positive')}</td>
                <td><strong>${e(b.customerName)}</strong><br><small>${e(b.customerPhone)}</small></td>
                <td>${e(b.summary)}</td>
                <td class="mono">${money(b.depositAmount)}</td>
                <td>${badge(b.status, 'positive')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </section>
  `;
}

function renderSipCarrier() {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];
  return `
    ${pageTop(
      'PHONE NUMBERS, SIP TRUNKS & DESK PHONES',
      'Business Phone Lines, Inbound/Outbound Caller ID & SIP Devices',
      'Manage ported business phone numbers, outbound CNAM caller-ID display, WebRTC browser/mobile softphones, and desk phones.'
    )}
    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">ACTIVE SIP TRUNK &amp; NUMBER INVENTORY</span>
            <h2>Line Configuration for ${e(preset.business)}</h2>
          </div>
          ${badge('E911 & STIR/SHAKEN Verified', 'positive')}
        </div>
        <table class="data-table">
          <tbody>
            <tr><td><strong>Primary Ported Business DID</strong></td><td class="mono">${e(preset.phoneNumber)}</td></tr>
            <tr><td><strong>Call Direction Support</strong></td><td>Bidirectional (Inbound 1st-Ring Answer + Outbound CNAM Dialing)</td></tr>
            <tr><td><strong>SIP Trunk Carrier</strong></td><td>Telnyx / Bandwidth Tier-1 Redundant SIP</td></tr>
            <tr><td><strong>Outbound Caller ID (STIR/SHAKEN)</strong></td><td>Attestation Level A (Verified Business Name Display)</td></tr>
            <tr><td><strong>Desk Phone &amp; Softphone Endpoints</strong></td><td>Browser WebRTC, iOS/iPadOS App, Yealink/Poly SIP TLS</td></tr>
            <tr><td><strong>Two-Way MCP Agent Endpoint</strong></td><td class="mono">GET/POST /api/agent/mcp (@openscaffold/voice)</td></tr>
          </tbody>
        </table>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">AUDIT STREAM</span>
            <h2>Live Voice &amp; SMS Activity Log</h2>
          </div>
          ${badge(`${state.audit.length} Events`, 'neutral')}
        </div>
        ${state.audit.length === 0 ? `<p>All inbound calls, outbound calls, and SMS dispatches appear here with timestamps.</p>` : `
          <ul style="margin:0;padding-left:1.2rem;line-height:1.6">
            ${state.audit.map(a => `<li><span class="mono" style="font-size:12px;color:var(--os-ink-muted)">${e(a.time)}</span> — ${e(a.message)}</li>`).join('')}
          </ul>
        `}
      </section>
    </div>
  `;
}

function render() {
  renderHeader();
  renderNav();
  const main = $('#main');
  if (!main) return;
  const tab = activeTab();
  if (tab === 'cockpit') main.innerHTML = renderCockpit();
  else if (tab === 'inbound-voice') main.innerHTML = renderInboundVoice();
  else if (tab === 'outbound-voice') main.innerHTML = renderOutboundVoice();
  else if (tab === 'sms-textback') main.innerHTML = renderSmsTextback();
  else if (tab === 'direct-booking') main.innerHTML = renderDirectBooking();
  else if (tab === 'sip-carrier') main.innerHTML = renderSipCarrier();
}

document.addEventListener('click', event => {
  const themeBtn = event.target.closest('[data-theme]');
  if (themeBtn) {
    setTheme(themeBtn.dataset.theme);
    return;
  }
  const actionBtn = event.target.closest('[data-action]');
  if (!actionBtn) return;
  const action = actionBtn.dataset.action;
  if (action === 'select-layer') {
    state.activeLayerId = actionBtn.dataset.layer;
    persist();
    render();
  } else if (action === 'simulate-call') {
    const {callRecord, booking} = simulateInboundVoiceCall(state);
    persist();
    render();
    notify(`Inbound ${callRecord.id} answered (${callRecord.latencyMs}ms), booked ${booking.id} & sent SMS confirmation`);
  } else if (action === 'simulate-outbound-call') {
    const {outRecord, booking} = simulateOutboundVoiceCall(state);
    persist();
    render();
    notify(`Outbound ${outRecord.id} completed to ${outRecord.targetName} (${booking.id})`);
  } else if (action === 'send-sms') {
    const msg = triggerMissedCallTextBack(state, actionBtn.dataset.tpl);
    persist();
    render();
    notify(`Sent ${msg.id} (${msg.templateName}) via 10DLC`);
  }
});

document.addEventListener('change', event => {
  const target = event.target;
  if (target.id === 'preset-picker') {
    selectPreset(target.value);
  } else if (target.id === 'top-theme-picker') {
    setTheme(target.value);
  } else if (target.dataset.calc) {
    state.calculator[target.dataset.calc] = Number(target.value) || 0;
    persist();
    render();
  } else if (target.dataset.voice) {
    state.voiceCall[target.dataset.voice] = target.type === 'number' ? Number(target.value) : target.value;
    persist();
    render();
  } else if (target.dataset.outbound) {
    state.outboundCall[target.dataset.outbound] = target.value;
    persist();
    render();
  }
});

window.addEventListener('hashchange', render);
render();
