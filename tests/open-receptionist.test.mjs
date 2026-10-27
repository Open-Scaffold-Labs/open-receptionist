import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createState,
  calculateReceptionistSavings,
  simulateInboundVoiceCall,
  simulateOutboundVoiceCall,
  triggerMissedCallTextBack,
  saveState,
  loadState
} from '../js/engine.js';
import {architectureLayers, receptionistPresets, smsTemplates, outboundCampaignTemplates} from '../js/data.js';
import {THEMES, listThemes} from '../js/theme.js';

test('1. architectureLayers defines all 5 layers of Open Scaffold Voice (@openscaffold/voice)', () => {
  assert.equal(architectureLayers.length, 5);
  assert.ok(architectureLayers[0].title.includes('SIP'));
  assert.ok(architectureLayers[1].title.includes('Inbound'));
  assert.ok(architectureLayers[2].title.includes('Outbound'));
});

test('2. receptionistPresets defines 6 vertical bidirectional voice profiles', () => {
  assert.equal(receptionistPresets.length, 6);
  for (const p of receptionistPresets) {
    assert.ok(p.id);
    assert.ok(p.business);
    assert.ok(p.greeting.length > 20);
    assert.ok(p.outboundTargetName);
    assert.ok(p.outboundScript.length > 20);
  }
});

test('3. calculateReceptionistSavings computes telecom metrics accurately', () => {
  const state = createState('dentist');
  const calc = calculateReceptionistSavings(state.calculator);
  assert.equal(calc.legacyAnnualTotal, (1078 + 650) * 12);
  assert.ok(calc.wholesaleMonthlyTotal < 100);
  assert.ok(calc.annualHardCostSavings > 19000);
  assert.ok(calc.recoveredAnnualRevenue > 40000);
  assert.equal(calc.totalEconomicImpact, calc.annualHardCostSavings + calc.recoveredAnnualRevenue);
});

test('4. simulateInboundVoiceCall creates INBOUND call log, schedule booking, and 10DLC SMS confirmation', () => {
  const state = createState('restaurant');
  const {callRecord, booking} = simulateInboundVoiceCall(state);
  assert.equal(callRecord.id, 'CALL-RESTAURANT-001');
  assert.equal(callRecord.direction, 'INBOUND');
  assert.equal(booking.id, 'BK-RESTAURANT-001');
  assert.equal(booking.direction, 'INBOUND');
  assert.equal(booking.marketplaceCommissionPaid, 0);
  assert.equal(state.smsThreads.length, 1);
  assert.equal(state.smsThreads[0].carrierCost, 0.004);
});

test('5. simulateOutboundVoiceCall creates OUTBOUND call log, schedule outcome, and follow-up SMS', () => {
  const state = createState('landscape');
  const {outRecord, booking} = simulateOutboundVoiceCall(state);
  assert.equal(outRecord.id, 'OUT-LANDSCAPE-001');
  assert.equal(outRecord.direction, 'OUTBOUND');
  assert.ok(outRecord.targetName.includes('Horizon Wholesale Nursery'));
  assert.equal(booking.direction, 'OUTBOUND');
  assert.equal(state.outboundLogs.length, 1);
  assert.equal(state.smsThreads.length, 1);
});

test('6. triggerMissedCallTextBack dispatches <2-second 10DLC SMS template at $0.004', () => {
  const state = createState('landscape');
  const msg = triggerMissedCallTextBack(state, 'missed-call');
  assert.equal(msg.id, 'SMS-LANDSCAPE-001');
  assert.ok(msg.body.includes('Diablo Valley Landscape'));
  assert.equal(msg.carrierCost, 0.004);
});

test('7. outboundCampaignTemplates, smsTemplates, and themes are valid and complete', () => {
  assert.equal(outboundCampaignTemplates.length, 4);
  assert.equal(smsTemplates.length, 4);
  assert.equal(listThemes().length, 4);
  assert.ok(THEMES['warm-editorial']);
});

test('8. saveState and loadState round-trip bidirectional state cleanly', () => {
  const mem = new Map();
  const storage = {
    getItem: k => mem.get(k) || null,
    setItem: (k, v) => mem.set(k, v)
  };
  const s = createState('golf');
  simulateInboundVoiceCall(s);
  simulateOutboundVoiceCall(s);
  assert.equal(saveState(s, storage), true);
  const loaded = loadState(storage);
  assert.equal(loaded.activePresetId, 'golf');
  assert.equal(loaded.callLogs.length, 1);
  assert.equal(loaded.outboundLogs.length, 1);
});
