import {clone, architectureLayers, receptionistPresets, smsTemplates, outboundCampaignTemplates} from './data.js';

export const STATE_KEY = 'openscaffold_voice.workspace.v1';
export const money = (value, digits = 2) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
}).format(Number(value) || 0);

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

export function createState(presetId = 'dentist') {
  const preset = receptionistPresets.find(p => p.id === presetId) || receptionistPresets[0];
  return {
    version: 1,
    activePresetId: preset.id,
    activeLayerId: architectureLayers[0].id,
    calculator: {
      legacyMonthlyStack: preset.legacyMonthlyCost,
      marketplaceMonthlyTolls: preset.marketplaceTollSavedMonthly,
      monthlyVoiceMinutes: preset.monthlyCallVolume * 2.2,
      monthlySmsMessages: preset.monthlySmsVolume,
      phoneNumbersCount: 2,
      recoveredCallsPerMonth: preset.recoveredMissedCallsPerMonth,
      avgBookingValue: preset.avgBookingValue
    },
    voiceCall: {
      callerName: preset.sampleCallerName,
      callerPhone: preset.sampleCallerPhone,
      callerBadge: preset.sampleCallerBadge,
      intent: preset.sampleIntent,
      depositAmount: preset.depositAmount,
      latencyMs: 320,
      autoSendSmsLink: true
    },
    outboundCall: {
      targetName: preset.outboundTargetName,
      targetPhone: preset.outboundTargetPhone,
      campaignType: preset.outboundCampaignType,
      script: preset.outboundScript,
      expectedOutcome: preset.outboundOutcome,
      sendFollowupSms: true
    },
    callLogs: [],
    outboundLogs: [],
    smsThreads: [],
    bookings: [],
    audit: []
  };
}

export function audit(state, message, now = new Date()) {
  state.audit.unshift({message, time: now.toISOString()});
  state.audit = state.audit.slice(0, 100);
}

export function calculateReceptionistSavings(calc) {
  const legacyMo = Math.max(0, Number(calc.legacyMonthlyStack) || 0);
  const marketplaceMo = Math.max(0, Number(calc.marketplaceMonthlyTolls) || 0);
  const legacyAnnualTotal = (legacyMo + marketplaceMo) * 12;

  const didCount = Math.max(1, Number(calc.phoneNumbersCount) || 2);
  const voiceMins = Math.max(0, Number(calc.monthlyVoiceMinutes) || 1500);
  const smsCount = Math.max(0, Number(calc.monthlySmsMessages) || 5000);

  const wholesaleSipMonthly = didCount * 1.00 + voiceMins * 0.0035;
  const wholesaleAiVoiceMonthly = voiceMins * 0.018;
  const wholesaleSmsMonthly = 2.00 + smsCount * 0.004;
  const wholesaleMonthlyTotal = Math.round((wholesaleSipMonthly + wholesaleAiVoiceMonthly + wholesaleSmsMonthly) * 100) / 100;

  const openReceptionistLicense = 299;
  const openReceptionistAnnualTotal = Math.round((openReceptionistLicense + wholesaleMonthlyTotal * 12) * 100) / 100;
  const annualHardCostSavings = Math.max(0, Math.round((legacyAnnualTotal - openReceptionistAnnualTotal) * 100) / 100);

  const recoveredCallsMo = Math.max(0, Number(calc.recoveredCallsPerMonth) || 0);
  const avgBooking = Math.max(0, Number(calc.avgBookingValue) || 0);
  const recoveredAnnualRevenue = Math.round(recoveredCallsMo * 0.35 * avgBooking * 12);

  return {
    legacyAnnualTotal,
    wholesaleMonthlyTotal,
    openReceptionistLicense,
    openReceptionistAnnualTotal,
    annualHardCostSavings,
    recoveredAnnualRevenue,
    totalEconomicImpact: annualHardCostSavings + recoveredAnnualRevenue
  };
}

export function simulateInboundVoiceCall(state, now = new Date()) {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];
  const callId = `CALL-${preset.id.toUpperCase()}-${String(state.callLogs.length + 1).padStart(3, '0')}`;
  const bookingId = `BK-${preset.id.toUpperCase()}-${String(state.bookings.length + 1).padStart(3, '0')}`;

  const callRecord = {
    id: callId,
    direction: 'INBOUND',
    business: preset.business,
    vertical: preset.vertical,
    callerName: state.voiceCall.callerName,
    callerPhone: state.voiceCall.callerPhone,
    callerBadge: state.voiceCall.callerBadge,
    intent: state.voiceCall.intent,
    latencyMs: state.voiceCall.latencyMs,
    durationSec: 68,
    wholesaleTelecomCost: 0.03,
    bookingId,
    depositAmount: Number(state.voiceCall.depositAmount) || preset.depositAmount,
    status: 'Inbound Answered on 1st Ring · Slot Booked + SMS Sent',
    createdAt: now.toISOString()
  };

  state.callLogs.unshift(callRecord);

  const booking = {
    id: bookingId,
    callId,
    direction: 'INBOUND',
    vertical: preset.vertical,
    business: preset.business,
    customerName: state.voiceCall.callerName,
    customerPhone: state.voiceCall.callerPhone,
    summary: state.voiceCall.intent,
    depositAmount: callRecord.depositAmount,
    marketplaceCommissionPaid: 0.00,
    openPaymentAchFee: 0.15,
    status: 'Confirmed in @openscaffold/schedule · Digital Pass Issued',
    createdAt: now.toISOString()
  };

  state.bookings.unshift(booking);

  if (state.voiceCall.autoSendSmsLink) {
    const smsId = `SMS-${preset.id.toUpperCase()}-${String(state.smsThreads.length + 1).padStart(3, '0')}`;
    const tpl = smsTemplates.find(t => t.id === 'confirm-pay') || smsTemplates[0];
    const renderedBody = tpl.bodyTemplate
      .replace('{callerName}', state.voiceCall.callerName)
      .replace('{business}', preset.business)
      .replace('{intent}', state.voiceCall.intent)
      .replace('{deposit}', money(callRecord.depositAmount));

    state.smsThreads.unshift({
      id: smsId,
      templateName: tpl.name,
      to: state.voiceCall.callerPhone,
      recipientName: state.voiceCall.callerName,
      business: preset.business,
      carrierCost: 0.004,
      body: renderedBody,
      status: 'Delivered via 10DLC ($0.004) · Open Payment Link Active',
      createdAt: now.toISOString()
    });
  }

  audit(state, `Inbound AI Voice answered ${callId} (${state.voiceCall.callerName}) in ${state.voiceCall.latencyMs}ms, booked ${bookingId}, and sent 10DLC SMS confirmation`, now);
  return {callRecord, booking};
}

export function simulateOutboundVoiceCall(state, now = new Date()) {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];
  const outId = `OUT-${preset.id.toUpperCase()}-${String(state.outboundLogs.length + 1).padStart(3, '0')}`;
  const bookingId = `BK-${preset.id.toUpperCase()}-${String(state.bookings.length + 1).padStart(3, '0')}`;

  const outRecord = {
    id: outId,
    direction: 'OUTBOUND',
    business: preset.business,
    vertical: preset.vertical,
    fromLine: preset.phoneNumber,
    targetName: state.outboundCall.targetName,
    targetPhone: state.outboundCall.targetPhone,
    campaignType: state.outboundCall.campaignType,
    script: state.outboundCall.script,
    outcome: state.outboundCall.expectedOutcome,
    durationSec: 54,
    wholesaleTelecomCost: 0.02,
    bookingId,
    status: 'Outbound Call Completed · Action Synced to Schedule/CRM',
    createdAt: now.toISOString()
  };

  state.outboundLogs.unshift(outRecord);

  const booking = {
    id: bookingId,
    callId: outId,
    direction: 'OUTBOUND',
    vertical: preset.vertical,
    business: preset.business,
    customerName: state.outboundCall.targetName,
    customerPhone: state.outboundCall.targetPhone,
    summary: `${state.outboundCall.campaignType}: ${state.outboundCall.expectedOutcome}`,
    depositAmount: preset.depositAmount,
    marketplaceCommissionPaid: 0.00,
    openPaymentAchFee: 0.15,
    status: 'Confirmed via Outbound Voice Call · Synced to @openscaffold/schedule',
    createdAt: now.toISOString()
  };

  state.bookings.unshift(booking);

  if (state.outboundCall.sendFollowupSms) {
    const smsId = `SMS-${preset.id.toUpperCase()}-${String(state.smsThreads.length + 1).padStart(3, '0')}`;
    state.smsThreads.unshift({
      id: smsId,
      templateName: `Outbound Call Follow-Up (${state.outboundCall.campaignType})`,
      to: state.outboundCall.targetPhone,
      recipientName: state.outboundCall.targetName,
      business: preset.business,
      carrierCost: 0.004,
      body: `Hi ${state.outboundCall.targetName}, following up on our call from ${preset.business}: ${state.outboundCall.expectedOutcome}.`,
      status: 'Delivered via 10DLC ($0.004)',
      createdAt: now.toISOString()
    });
  }

  audit(state, `Outbound AI Voice dialed ${outId} to ${state.outboundCall.targetName} (${state.outboundCall.targetPhone}): ${state.outboundCall.expectedOutcome}`, now);
  return {outRecord, booking};
}

export function triggerMissedCallTextBack(state, templateId = 'missed-call', now = new Date()) {
  const preset = receptionistPresets.find(p => p.id === state.activePresetId) || receptionistPresets[0];
  const tpl = smsTemplates.find(t => t.id === templateId) || smsTemplates[0];
  const smsId = `SMS-${preset.id.toUpperCase()}-${String(state.smsThreads.length + 1).padStart(3, '0')}`;
  const renderedBody = tpl.bodyTemplate
    .replace('{callerName}', state.voiceCall.callerName)
    .replace('{business}', preset.business)
    .replace('{intent}', state.voiceCall.intent)
    .replace('{deposit}', money(state.voiceCall.depositAmount || preset.depositAmount));

  const msg = {
    id: smsId,
    templateName: tpl.name,
    to: state.voiceCall.callerPhone,
    recipientName: state.voiceCall.callerName,
    business: preset.business,
    carrierCost: 0.004,
    body: renderedBody,
    status: 'Delivered in 1.4s via Carrier 10DLC ($0.004)',
    createdAt: now.toISOString()
  };

  state.smsThreads.unshift(msg);
  audit(state, `Triggered ${tpl.name} (${smsId}) to ${state.voiceCall.callerPhone} at $0.004 carrier cost`, now);
  return msg;
}

export function saveState(state, storage) {
  if (!storage) return false;
  try {
    storage.setItem(STATE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function loadState(storage) {
  if (!storage) return createState();
  try {
    const raw = storage.getItem(STATE_KEY);
    if (!raw) return createState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return createState();
    return {...createState(parsed.activePresetId), ...parsed};
  } catch {
    return createState();
  }
}
