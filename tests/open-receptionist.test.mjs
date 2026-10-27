import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createState,
  calculateReceptionistSavings,
  simulateInboundVoiceCall,
  triggerMissedCallTextBack,
  saveState,
  loadState
} from '../js/engine.js';
import {architectureLayers, receptionistPresets, smsTemplates} from '../js/data.js';
import {THEMES, listThemes} from '../js/theme.js';

test('1. architectureLayers defines all 5 layers of Open Receptionist OS', () => {
  assert.equal(architectureLayers.length, 5);
  assert.ok(architectureLayers[0].title.includes('SIP'));
  assert.ok(architectureLayers[2].title.includes('10DLC'));
});

test('2. receptionistPresets defines 6 vertical receptionist profiles', () => {
  assert.equal(receptionistPresets.length, 6);
  for (const p of receptionistPresets) {
    assert.ok(p.id);
    assert.ok(p.business);
    assert.ok(p.greeting.length > 20);
  }
});

test('3. calculateReceptionistSavings computes hard telecom savings and recovered call revenue', () => {
  const state = createState('dentist');
  const calc = calculateReceptionistSavings(state.calculator);
  assert.equal(calc.legacyAnnualTotal, (1078 + 650) * 12);
  assert.ok(calc.wholesaleMonthlyTotal < 100);
  assert.ok(calc.annualHardCostSavings > 19000);
  assert.ok(calc.recoveredAnnualRevenue > 40000);
  assert.equal(calc.totalEconomicImpact, calc.annualHardCostSavings + calc.recoveredAnnualRevenue);
});

test('4. simulateInboundVoiceCall creates call log, zero-commission booking, and 10DLC SMS confirmation', () => {
  const state = createState('restaurant');
  const {callRecord, booking} = simulateInboundVoiceCall(state);
  assert.equal(callRecord.id, 'CALL-RESTAURANT-001');
  assert.equal(booking.id, 'BK-RESTAURANT-001');
  assert.equal(booking.marketplaceCommissionPaid, 0);
  assert.equal(state.smsThreads.length, 1);
  assert.equal(state.smsThreads[0].carrierCost, 0.004);
});

test('5. triggerMissedCallTextBack dispatches <2-second 10DLC SMS template at $0.004', () => {
  const state = createState('landscape');
  const msg = triggerMissedCallTextBack(state, 'missed-call');
  assert.equal(msg.id, 'SMS-LANDSCAPE-001');
  assert.ok(msg.body.includes('Diablo Valley Landscape'));
  assert.equal(msg.carrierCost, 0.004);
});

test('6. smsTemplates and themes are valid and complete', () => {
  assert.equal(smsTemplates.length, 4);
  assert.equal(listThemes().length, 4);
  assert.ok(THEMES['warm-editorial']);
});

test('7. saveState and loadState round-trip state cleanly', () => {
  const mem = new Map();
  const storage = {
    getItem: k => mem.get(k) || null,
    setItem: (k, v) => mem.set(k, v)
  };
  const s = createState('golf');
  simulateInboundVoiceCall(s);
  assert.equal(saveState(s, storage), true);
  const loaded = loadState(storage);
  assert.equal(loaded.activePresetId, 'golf');
  assert.equal(loaded.callLogs.length, 1);
});
