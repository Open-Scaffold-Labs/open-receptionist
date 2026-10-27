import {architectureLayers, receptionistPresets, smsTemplates} from './data.js';
import {THEMES, applyTheme, loadSavedTheme, listThemes} from './theme.js';
import {
  money,
  escapeHTML as e,
  createState,
  audit,
  calculateReceptionistSavings,
  simulateInboundVoiceCall,
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
  ['cockpit', '◫', 'Live Call Queue & Activity'],
  ['voice-ai', '🎙', 'AI Voice Receptionist'],
  ['sms-textback', '💬', 'Two-Way SMS Inbox'],
  ['direct-booking', '📅', 'Appointments & Deposits'],
  ['sip-carrier', '☎', 'Phone Numbers & Desk Phones']
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
  state.calculator.legacyMonthlyStack = preset.legacyMonthlyCost;
  state.calculator.marketplaceMonthlyTolls = preset.marketplaceTollSavedMonthly;
  state.calculator.monthlyVoiceMinutes = Math.round(preset.monthlyCallVolume * 2.2);
  state.calculator.monthlySmsMessages = preset.monthlySmsVolume;
  state.calculator.recoveredCallsPerMonth = preset.recoveredMissedCallsPerMonth;
  state.calculator.avgBookingValue = preset.avgBookingValue;
  state.voiceCall.callerName = preset.sampleCallerName;
  state.voiceCall.callerPhone = preset.sampleCallerPhone;
  state.voiceCall.callerBadge = preset.sampleCallerBadge;
  state.voiceCall.intent = preset.sampleIntent;
  state.voiceCall.depositAmount = preset.depositAmount;
  audit(state, `Switched active receptionist preset to ${preset.vertical} (${preset.business})`);
  persist();
  render();
  notify(`Loaded ${preset.vertical} receptionist profile: ${preset.business}`);
}

function renderCockpit() {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];

  return `
    ${pageTop(
      'FRONT-DESK COMMUNICATIONS & RECEPTION CONSOLE',
      `${preset.business} — Live Call Queue, SMS & Bookings (${preset.phoneNumber})`,
      'Monitor incoming phone calls, caller-ID customer profiles, two-way text conversations, and appointments scheduled today.',
      button('Answer Incoming Call & Book Appointment', 'simulate-call', 'primary')
    )}
    <div class="kpi-grid">
      <article class="kpi-card">
        <span class="eyebrow">ACTIVE BUSINESS PHONE LINE</span>
        <strong class="kpi-value">${e(preset.phoneNumber)}</strong>
        <p>${e(preset.business)} · All lines online</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">CALLS ANSWERED IN SESSION</span>
        <strong class="kpi-value">${state.callLogs.length}</strong>
        <p>${state.voiceCall.latencyMs}ms AI voice response · 0 missed calls</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">APPOINTMENTS BOOKED</span>
        <strong class="kpi-value">${state.bookings.length}</strong>
        <p>Synced to schedule with deposit links</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">TWO-WAY SMS MESSAGES SENT</span>
        <strong class="kpi-value">${state.smsThreads.length}</strong>
        <p>Instant confirmations &amp; missed-call text-backs</p>
      </article>
    </div>

    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">RECENT INBOUND CALLS &amp; SCREEN-POPS</span>
            <h2>Live Call Activity</h2>
          </div>
          ${badge('1st-Ring Auto-Answer Active', 'positive')}
        </div>
        ${state.callLogs.length === 0 ? `
          <div class="callout" style="margin-bottom:1rem">
            <strong>Next Caller Ready on Line 1: ${e(state.voiceCall.callerName)} (${e(state.voiceCall.callerPhone)})</strong>
            <p><strong>Customer Profile:</strong> ${e(state.voiceCall.callerBadge)}</p>
            <p><strong>Caller Request:</strong> “${e(state.voiceCall.intent)}”</p>
          </div>
          ${button('Answer Call & Book Appointment Now', 'simulate-call', 'primary')}
        ` : `
          <table class="data-table">
            <thead>
              <tr><th>Call ID</th><th>Caller</th><th>Booked Action</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.callLogs.map(c => `
                <tr>
                  <td class="mono"><strong>${e(c.id)}</strong></td>
                  <td><strong>${e(c.callerName)}</strong><br><small>${e(c.callerPhone)} · ${e(c.callerBadge)}</small></td>
                  <td>${e(c.intent)}<br><small>Booking ${e(c.bookingId)}</small></td>
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
            <span class="eyebrow">ACTIVE RECEPTIONIST GREETING &amp; ROUTING</span>
            <h2>Line Settings &amp; Quick Actions</h2>
          </div>
          ${badge(preset.vertical, 'info')}
        </div>
        <div class="callout" style="margin-bottom:1rem">
          <strong>Active Spoken Greeting:</strong>
          <p>“${e(preset.greeting)}”</p>
        </div>
        <table class="data-table">
          <tbody>
            <tr><td><strong>Primary Phone Number</strong></td><td class="mono">${e(preset.phoneNumber)}</td></tr>
            <tr><td><strong>Default Appointment Deposit</strong></td><td class="mono">${money(preset.depositAmount)}</td></tr>
            <tr><td><strong>Overflow &amp; After-Hours Rule</strong></td><td>Answer on 1st ring · Book directly to calendar · Text confirmation</td></tr>
          </tbody>
        </table>
        <div style="margin-top:1rem;display:flex;gap:0.75rem;flex-wrap:wrap">
          <a href="#tab-voice-ai" class="btn primary">Configure AI Voice Receptionist →</a>
          <a href="#tab-sms-textback" class="btn">Open Two-Way SMS Inbox →</a>
          <a href="#tab-direct-booking" class="btn">View Scheduled Bookings →</a>
        </div>
      </section>
    </div>
  `;
}

function renderVoiceAi() {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];
  return `
    ${pageTop(
      `AI VOICE RECEPTIONIST & CALL ROUTING · ${preset.vertical.toUpperCase()}`,
      `${preset.business} · Live Caller-ID Screen-Pop & Schedule Negotiator`,
      e(preset.highlight),
      button('Answer Call, Book Slot & Text Deposit Link', 'simulate-call', 'primary')
    )}
    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">INBOUND CALL SIMULATOR &amp; @OPENSCAFFOLD/CRM SCREEN-POP</span>
            <h2>Caller Recognized on Line 1: ${e( preset.phoneNumber )}</h2>
          </div>
          ${badge(`${state.voiceCall.latencyMs}ms Voice Latency`, 'positive')}
        </div>
        <div class="callout" style="margin-bottom:1rem">
          <strong>AI Voice Greeting:</strong>
          <p>“${e(preset.greeting)}”</p>
        </div>
        <div class="form-grid">
          <label>Caller Name (@openscaffold/crm Match)
            <input type="text" value="${e(state.voiceCall.callerName)}" data-voice="callerName">
          </label>
          <label>Caller Mobile Number (10DLC SMS Target)
            <input type="text" value="${e(state.voiceCall.callerPhone)}" data-voice="callerPhone">
          </label>
          <label>CRM X-Ray Badge
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
            <span class="eyebrow">LIVE AI VOICE CALL LOG</span>
            <h2>Answered Calls &amp; Instant Bookings (${state.callLogs.length})</h2>
          </div>
          ${badge('Zero Missed Calls', 'positive')}
        </div>
        ${state.callLogs.length === 0 ? `<p>Click <strong>Answer Call, Book Slot &amp; Text Deposit Link</strong> to simulate an inbound call handled end-to-end by Open Receptionist OS.</p>` : `
          <table class="data-table">
            <thead>
              <tr><th>Call ID</th><th>Caller &amp; CRM Badge</th><th>Booked Action</th><th>Telecom Cost</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.callLogs.map(c => `
                <tr>
                  <td class="mono"><strong>${e(c.id)}</strong><br><small>${c.latencyMs}ms latency</small></td>
                  <td><strong>${e(c.callerName)}</strong> (${e(c.callerPhone)})<br><small>${e(c.callerBadge)}</small></td>
                  <td>${e(c.intent)}<br><small>Booking ${e(c.bookingId)} · Deposit ${money(c.depositAmount)}</small></td>
                  <td class="mono">${money(c.wholesaleTelecomCost)}</td>
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

function renderSmsTextback() {
  return `
    ${pageTop(
      'TWO-WAY SMS INBOX & AUTOMATED TEXT TEMPLATES',
      'Missed-Call Text-Back, Appointment Confirmations & Recall Reminders',
      'Send and receive customer text messages, dispatch instant missed-call text-backs, and send appointment deposit and confirmation links.'
    )}
    <div class="grid-2">
      ${smsTemplates.map(tpl => `
        <article class="card">
          <div class="card-head">
            <div>
              <span class="eyebrow">${e(tpl.trigger)}</span>
              <h2>${e(tpl.name)}</h2>
            </div>
            ${badge(tpl.carrierCost, 'positive')}
          </div>
          <p><strong>Conversion Benchmark:</strong> ${e(tpl.conversionRate)}</p>
          <div class="callout" style="margin:0.75rem 0">
            <p class="mono">${e(tpl.bodyTemplate)}</p>
          </div>
          ${button(`Fire ${tpl.name} ($0.004)`, 'send-sms', 'primary', `data-tpl="${tpl.id}"`)}
        </article>
      `).join('')}
    </div>

    <section class="card" style="margin-top:1rem">
      <div class="card-head">
        <div>
          <span class="eyebrow">10DLC CARRIER MESSAGE LOG</span>
          <h2>Delivered Two-Way SMS &amp; Payment Links (${state.smsThreads.length})</h2>
        </div>
        ${badge('$0.004 / segment', 'positive')}
      </div>
      ${state.smsThreads.length === 0 ? `<p>Trigger any SMS template above or run a voice call simulation to see live 10DLC message delivery.</p>` : `
        <table class="data-table">
          <thead>
            <tr><th>Message ID</th><th>Recipient</th><th>Template</th><th>Message Body</th><th>Cost</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${state.smsThreads.map(m => `
              <tr>
                <td class="mono"><strong>${e(m.id)}</strong></td>
                <td><strong>${e(m.recipientName)}</strong><br><small>${e(m.to)}</small></td>
                <td>${e(m.templateName)}</td>
                <td><small>${e(m.body)}</small></td>
                <td class="mono">$0.004</td>
                <td>${badge(m.status, 'positive')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </section>
  `;
}

function renderDirectBooking() {
  return `
    ${pageTop(
      'APPOINTMENTS, RESERVATIONS & DEPOSIT LINKS',
      'Scheduled Bookings & Deposit Status',
      'Review appointments and reservations booked by phone or SMS, verify deposit payments, and issue Apple/Google Wallet passes.',
      button('Create Direct Voice/SMS Booking', 'simulate-call', 'primary')
    )}
    <section class="card">
      <div class="card-head">
        <div>
          <span class="eyebrow">@OPENSCAFFOLD/SCHEDULE LIVE LEDGER</span>
          <h2>First-Party Bookings (${state.bookings.length}) · $0.00 Marketplace Commission</h2>
        </div>
        ${badge('Pay = Member VIP Loop Active', 'positive')}
      </div>
      ${state.bookings.length === 0 ? `<p>No bookings recorded in this session yet. Click <strong>Create Direct Voice/SMS Booking</strong> above to test the zero-commission booking loop.</p>` : `
        <table class="data-table">
          <thead>
            <tr><th>Booking ID</th><th>Customer</th><th>Appointment / Reservation</th><th>Deposit</th><th>Marketplace Fee</th><th>Open Payment Fee</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${state.bookings.map(b => `
              <tr>
                <td class="mono"><strong>${e(b.id)}</strong><br><small>From ${e(b.callId)}</small></td>
                <td><strong>${e(b.customerName)}</strong><br><small>${e(b.customerPhone)}</small></td>
                <td>${e(b.summary)}</td>
                <td class="mono">${money(b.depositAmount)}</td>
                <td class="mono">$0.00</td>
                <td class="mono">${money(b.openPaymentAchFee)}</td>
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
      'PHONE NUMBERS, SIP DESK PHONES & CALL FORWARDING',
      'Business Phone Numbers, Extensions & Device Credentials',
      `Port ${preset.phoneNumber} (${preset.business}) directly onto our Tier-1 wholesale carrier trunks (Telnyx / Bandwidth) with zero downtime, unlimited WebRTC browser/mobile extensions, and E911 + CNAM caller-ID registration.`
    )}
    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">FCC LNP NUMBER PORTING &amp; WEBRTC PROVISIONING</span>
            <h2>Active SIP Trunk Configuration</h2>
          </div>
          ${badge('Tier-1 Carrier Active', 'positive')}
        </div>
        <table class="data-table">
          <tbody>
            <tr><td><strong>Primary Business DID</strong></td><td class="mono">${e(preset.phoneNumber)} (${e(preset.business)})</td></tr>
            <tr><td><strong>Wholesale DID Monthly Cost</strong></td><td class="mono">$1.00 / month (vs. $35–$45/seat on RingCentral)</td></tr>
            <tr><td><strong>Inbound / Outbound SIP Voice Rate</strong></td><td class="mono">$0.0035 / minute</td></tr>
            <tr><td><strong>Campaign Registry 10DLC Trust Score</strong></td><td class="mono">Verified High-Throughput (75 msg/sec · $0.004/SMS)</td></tr>
            <tr><td><strong>Failover &amp; Ring Routing</strong></td><td>Simultaneous WebRTC Desk/Mobile Ring + 1st-Ring AI Voice Overflow</td></tr>
          </tbody>
        </table>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">HARDWARE FREEDOM</span>
            <h2>Works on Every Device Your Team Already Owns</h2>
          </div>
          ${badge('$0 Hardware Lock-In', 'positive')}
        </div>
        <div class="callout">
          <strong>1. Browser &amp; iPad Cockpit Softphone</strong>
          <p>Answer calls and see instant CRM patient/guest/client screen-pops right inside any Open Scaffold Labs app with zero software install.</p>
        </div>
        <div class="callout" style="margin-top:0.75rem">
          <strong>2. iPhone &amp; Android Mobile App</strong>
          <p>Business calls and two-way 10DLC texts ring in the staff app while keeping owners’ and technicians’ personal cell numbers 100% private.</p>
        </div>
        <div class="callout" style="margin-top:0.75rem">
          <strong>3. Existing Yealink / Poly / Cisco Desk Phones</strong>
          <p>Standard SIP credentials drop straight into existing PoE office desk phones—no proprietary Weave phones to lease.</p>
        </div>
      </section>
    </div>
  `;
}

export function render() {
  renderHeader();
  renderNav();
  const main = $('#main');
  if (!main) return;
  const tab = activeTab();
  if (tab === 'cockpit') main.innerHTML = renderCockpit();
  else if (tab === 'voice-ai') main.innerHTML = renderVoiceAi();
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
    notify(`Answered ${callRecord.id} (${callRecord.latencyMs}ms), booked ${booking.id} & sent $0.004 SMS link`);
  } else if (action === 'send-sms') {
    const msg = triggerMissedCallTextBack(state, actionBtn.dataset.tpl);
    persist();
    render();
    notify(`Sent ${msg.id} (${msg.templateName}) via 10DLC ($0.004)`);
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
  }
});

window.addEventListener('hashchange', render);
render();
