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
  ['cockpit', '◫', 'Morning cockpit'],
  ['voice-ai', '🎙', '24/7 AI voice receptionist'],
  ['sms-textback', '💬', '10DLC SMS & text-back'],
  ['direct-booking', '📅', 'Zero-commission booking'],
  ['sip-carrier', '☎', 'Wholesale SIP & porting']
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
  const calc = calculateReceptionistSavings(state.calculator);
  const activeLayer = architectureLayers.find(l => l.id === state.activeLayerId) || architectureLayers[0];

  return `
    ${pageTop(
      'WHITE-LABEL WEAVE, PODIUM, RINGCENTRAL & OPENTABLE REPLACEMENT · @OPENSCAFFOLD/VOICE-RECEPTIONIST V1.0',
      '24/7 AI Voice, Wholesale SIP Phone, 10DLC SMS & Direct Booking OS',
      'Small businesses pay $500–$2,500/month across Weave, Podium, RingCentral, Smith.ai, and OpenTable/GolfNow cover tolls. Open Receptionist OS connects direct $1/mo wholesale SIP trunks and $0.004 carrier 10DLC SMS directly to @openscaffold/schedule, @openscaffold/crm, and @openscaffold/payment.',
      button('Simulate Live Inbound Call & Booking', 'simulate-call', 'primary')
    )}
    <div class="kpi-grid">
      <article class="kpi-card">
        <span class="eyebrow">HARD TELECOM &amp; MARKETPLACE SAVINGS</span>
        <strong class="kpi-value">${money(calc.annualHardCostSavings, 0)}/yr</strong>
        <p>Replaces ${e(preset.legacyStack)}</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">WHOLESALE CARRIER COST</span>
        <strong class="kpi-value">${money(calc.wholesaleMonthlyTotal)}/mo</strong>
        <p>$1.00/mo SIP DID · $0.004/SMS · $0.0035/min voice</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">RECOVERED MISSED-CALL REVENUE</span>
        <strong class="kpi-value">+${money(calc.recoveredAnnualRevenue, 0)}/yr</strong>
        <p>${state.calculator.recoveredCallsPerMonth} missed calls/mo answered on 1st ring</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">MARKETPLACE COVER / LEAD TOLL</span>
        <strong class="kpi-value">$0.00 / booking</strong>
        <p>${state.bookings.length} direct bookings · ${state.smsThreads.length} 10DLC texts sent</p>
      </article>
    </div>

    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">5-LAYER TELECOM, AI VOICE &amp; DIRECT BOOKING STACK</span>
            <h2>Why Weave, Podium &amp; RingCentral Cost 25× Wholesale</h2>
          </div>
          ${badge('Wholesale Carrier Direct', 'positive')}
        </div>
        <div class="layer-list">
          ${architectureLayers.map(layer => `
            <button type="button" class="layer-item ${layer.id === activeLayer.id ? 'active' : ''}" data-action="select-layer" data-layer="${layer.id}">
              <div>
                <strong>${e(layer.number)} · ${e(layer.title)}</strong>
                <small>${e(layer.replacement)}</small>
              </div>
              ${badge(layer.savingMetric, 'positive')}
            </button>
          `).join('')}
        </div>
        <div class="callout" style="margin-top:1rem">
          <strong>${e(activeLayer.number)}: ${e(activeLayer.title)}</strong>
          <p>${e(activeLayer.summary)}</p>
          <p><strong>Legacy Retail Toll:</strong> ${e(activeLayer.legacyTax)}<br><strong>Open Receptionist Cost:</strong> ${e(activeLayer.openReceptionistCost)}</p>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">INTERACTIVE TELECOM &amp; BOOKING TOLL CALCULATOR</span>
            <h2>Compare Weave + Podium + RingCentral + OpenTable vs. Open Receptionist</h2>
          </div>
          ${badge(preset.vertical, 'info')}
        </div>
        <div class="form-grid">
          <label>Legacy Phone/SMS SaaS ($/mo)
            <input type="number" min="0" step="50" value="${state.calculator.legacyMonthlyStack}" data-calc="legacyMonthlyStack">
          </label>
          <label>Monthly Cover / Lead Tolls ($/mo)
            <input type="number" min="0" step="50" value="${state.calculator.marketplaceMonthlyTolls}" data-calc="marketplaceMonthlyTolls">
          </label>
          <label>Monthly Voice Minutes
            <input type="number" min="100" step="100" value="${state.calculator.monthlyVoiceMinutes}" data-calc="monthlyVoiceMinutes">
          </label>
          <label>Monthly 10DLC SMS Messages
            <input type="number" min="500" step="500" value="${state.calculator.monthlySmsMessages}" data-calc="monthlySmsMessages">
          </label>
          <label>Missed Calls Recovered / Month
            <input type="number" min="0" step="2" value="${state.calculator.recoveredCallsPerMonth}" data-calc="recoveredCallsPerMonth">
          </label>
          <label>Average Booking / Ticket Value ($)
            <input type="number" min="25" step="25" value="${state.calculator.avgBookingValue}" data-calc="avgBookingValue">
          </label>
        </div>
        <table class="data-table" style="margin-top:1rem">
          <thead>
            <tr><th>Line Item</th><th>Legacy Stack</th><th>Open Receptionist OS</th></tr>
          </thead>
          <tbody>
            <tr><td>Annual Phone, SMS, AI &amp; Cover Fees</td><td class="mono">${money(calc.legacyAnnualTotal)}/yr</td><td class="mono">${money(calc.openReceptionistAnnualTotal)}/yr</td></tr>
            <tr><td>Wholesale Carrier Telecom (SIP + 10DLC + Voice AI)</td><td class="mono">Bundled at 25× markup</td><td class="mono">${money(calc.wholesaleMonthlyTotal)}/mo</td></tr>
            <tr><td>Annual Hard-Dollar Cost Savings</td><td class="mono">—</td><td class="mono"><strong>+${money(calc.annualHardCostSavings)}/yr</strong></td></tr>
            <tr><td>Recovered Missed-Call Booking Revenue (35% conv.)</td><td class="mono">$0.00 (Voicemail hang-ups)</td><td class="mono"><strong>+${money(calc.recoveredAnnualRevenue)}/yr</strong></td></tr>
          </tbody>
        </table>
      </section>
    </div>
  `;
}

function renderVoiceAi() {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];
  return `
    ${pageTop(
      `LAYER 2 · 24/7 SUB-400MS STREAMING AI VOICE RECEPTIONIST · ${preset.vertical.toUpperCase()}`,
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
      'LAYER 3 · WHOLESALE $0.004 10DLC TWO-WAY SMS & <2-SECOND MISSED-CALL TEXT-BACK',
      'Replace $500–$800/mo Weave & Podium Contracts with $0.004 Carrier SMS',
      'Every appointment confirmation, 6-month hygiene/service recall, missed-call text-back, and Google review request goes out over direct Campaign Registry 10DLC carrier rails at $0.004 per message.'
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
      'LAYER 4 · ZERO-COMMISSION FIRST-PARTY SCHEDULE & PAY=MEMBER CRM LOOP',
      'Eliminate OpenTable Per-Cover Fees, GolfNow Barter Rounds & Lead Tolls',
      'Every voice call, SMS reply, and website booking writes directly into @openscaffold/schedule, issues a VIP Apple Wallet pass, and collects deposits via @openscaffold/payment at $0.15 flat ACH.',
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
      'LAYER 1 · WHOLESALE TIER-1 CARRIER SIP TRUNKING & NUMBER PORTING',
      'Keep Your Existing Business Number — Cut the Phone Bill by 95%',
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
