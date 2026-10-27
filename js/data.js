export const clone = value => JSON.parse(JSON.stringify(value));

export const architectureLayers = [
  {
    id: 'layer-1',
    number: 'Layer 1',
    title: 'Carrier SIP Trunking, Number Porting & WebRTC Softphone',
    replacement: 'Direct Tier-1 Carrier SIP API (Telnyx / Bandwidth)',
    legacyTax: '$35–$45/user/month on legacy VoIP',
    openReceptionistCost: '$1.00/mo per local/toll-free DID + $0.0035/min SIP voice',
    summary: 'Ports business phone numbers onto Tier-1 carrier SIP trunks with browser/iOS/iPad WebRTC softphones and standard Yealink/Poly desk-phone registration.',
    modules: ['Carrier SIP Trunk Router', 'WebRTC Browser/Mobile Softphone', 'E911 & CNAM Caller ID Registry'],
    savingMetric: 'Inbound + Outbound SIP lines active'
  },
  {
    id: 'layer-2',
    number: 'Layer 2',
    title: 'Inbound 24/7 AI Voice Answering & Routing (@openscaffold/voice)',
    replacement: 'Streaming Voice AI Connected Live to @openscaffold/schedule & CRM',
    legacyTax: 'Missed calls and voicemail hang-ups',
    openReceptionistCost: 'Sub-400ms streaming voice AI',
    summary: 'Answers inbound calls on the first ring, greets callers using @openscaffold/crm caller-ID lookup, answers business FAQs, and books or reschedules slots in @openscaffold/schedule.',
    modules: ['@openscaffold/voice Inbound Engine', 'CRM Caller-ID Screen-Pop', 'Live Schedule Slot Negotiator'],
    savingMetric: '1st-ring inbound answering'
  },
  {
    id: 'layer-3',
    number: 'Layer 3',
    title: 'Outbound AI Voice Dialer, Confirmations, Recalls & Vendor Dispatch',
    replacement: 'Proactive Outbound Voice Agent + Automated Voicemail Drop & SMS Follow-Up',
    legacyTax: 'Hours of staff phone tag for confirmations, recalls, and vendor/crew coordination',
    openReceptionistCost: 'Automated single-call & batch outbound voice workflows',
    summary: 'Places outbound voice calls for appointment confirmations, 6-month hygiene/service recalls, waitlist backfill, crew/vendor dispatch, and past-due invoice or assessment follow-ups.',
    modules: ['@openscaffold/voice Outbound Dialer', 'Live Transcript & Outcome Tagging', 'Voicemail Detection + SMS Fallback'],
    savingMetric: 'Proactive outbound voice automation'
  },
  {
    id: 'layer-4',
    number: 'Layer 4',
    title: 'Two-Way 10DLC SMS Inbox & <2-Second Missed-Call Text-Back',
    replacement: 'Direct Campaign Registry 10DLC Carrier Messaging',
    legacyTax: 'Fragmented texting tools',
    openReceptionistCost: '$0.004 per SMS segment',
    summary: 'Unified two-way SMS inbox, automated appointment confirmations, recall campaigns, and instant <2-second missed-call text-back.',
    modules: ['@openscaffold/messaging v1.1', 'Instant Missed-Call Text-Back', 'Two-Way SMS Threading'],
    savingMetric: 'Instant SMS sync'
  },
  {
    id: 'layer-5',
    number: 'Layer 5',
    title: 'Direct Schedule Booking & @openscaffold/payment Deposit Links',
    replacement: 'Embedded @openscaffold/schedule + @openscaffold/payment Links',
    legacyTax: 'Manual booking & payment collection',
    openReceptionistCost: '$0.15 flat Bank ACH / Apple Pay deposit links',
    summary: 'Every inbound or outbound call and SMS thread books directly into @openscaffold/schedule and dispatches a 1-tap payment or deposit link.',
    modules: ['@openscaffold/schedule v0.1', '@openscaffold/payment v1.0', '@openscaffold/books v3.3'],
    savingMetric: 'Real-time schedule & ledger sync'
  }
];

export const receptionistPresets = [
  {
    id: 'dentist',
    vertical: 'Open Dentist',
    business: 'ClearSight Dental Studio',
    phoneNumber: '(925) 555-0148',
    legacyStack: 'Dental Front-Desk Inbound & Outbound Recall Line',
    legacyMonthlyCost: 1078,
    monthlyCallVolume: 850,
    monthlySmsVolume: 6500,
    avgBookingValue: 680,
    recoveredMissedCallsPerMonth: 18,
    marketplaceTollSavedMonthly: 650,
    greeting: 'Thank you for calling ClearSight Dental Studio! I can book or reschedule an appointment, verify insurance, or connect you with our clinical team.',
    sampleCallerName: 'Sarah Jenkins',
    sampleCallerPhone: '(925) 412-8830',
    sampleCallerBadge: 'Existing Patient · Delta Dental PPO Verified · 6-Month Hygiene Due · Prefers Tue/Thu Mornings',
    sampleIntent: 'Book 6-month hygiene cleaning + exam for Thursday at 9:30 AM and send copay link',
    outboundTargetName: 'Michael Torres',
    outboundTargetPhone: '(925) 689-3310',
    outboundCampaignType: '6-Month Hygiene Recall & Unscheduled Treatment Follow-Up',
    outboundScript: 'Hi Michael, this is ClearSight Dental Studio calling to let you know you are due for your 6-month hygiene cleaning and we had an opening this Thursday at 11:00 AM or Friday at 2:00 PM. Would you like me to lock one of those in for you?',
    outboundOutcome: 'Answered Live · Confirmed Thursday 11:00 AM Hygiene Slot & Texted Calendar Pass',
    depositAmount: 45.00,
    highlight: 'Inbound 1st-ring patient scheduling + Outbound 6-month hygiene recall, tomorrow appointment confirmation, and unscheduled treatment follow-up calls.'
  },
  {
    id: 'restaurant',
    vertical: 'Open Restaurant',
    business: 'Harbor & Hearth Bistro',
    phoneNumber: '(925) 555-0192',
    legacyStack: 'Host Stand Inbound Reservations & Outbound VIP / Private Dining Confirmation Line',
    legacyMonthlyCost: 2048,
    monthlyCallVolume: 1450,
    monthlySmsVolume: 9200,
    avgBookingValue: 165,
    recoveredMissedCallsPerMonth: 34,
    marketplaceTollSavedMonthly: 1150,
    greeting: 'Good evening, thank you for calling Harbor & Hearth Bistro! I can reserve a table, check tonight’s specials, or connect you with private dining.',
    sampleCallerName: 'Elena Rostova',
    sampleCallerPhone: '(925) 890-4412',
    sampleCallerBadge: 'Gold VIP · 14 Visits · Shellfish Allergy · Table 12 Window Booth Preference',
    sampleIntent: 'Reserve Table 12 for 4 guests this Friday at 7:15 PM (note shellfish allergy on chef chit)',
    outboundTargetName: 'Marcus Sterling (Party of 8 — Saturday 7:30 PM)',
    outboundTargetPhone: '(925) 401-9920',
    outboundCampaignType: 'Same-Day Large-Party Reservation & Dietary Confirmation Call',
    outboundScript: 'Hello Marcus, calling from Harbor & Hearth Bistro to confirm your party of 8 tonight at 7:30 PM and verify if any guests have allergies for Chef’s tasting menu.',
    outboundOutcome: 'Answered Live · Confirmed 8 Guests for 7:30 PM (1 Gluten-Free Noted on Kitchen Chit)',
    depositAmount: 100.00,
    highlight: 'Inbound dinner-rush reservation handling + Outbound large-party confirmations, waitlist table-ready calls, and purveyor order follow-ups.'
  },
  {
    id: 'landscape',
    vertical: 'Open Landscape Business',
    business: 'Diablo Valley Landscape & Maintenance',
    phoneNumber: '(925) 555-0177',
    legacyStack: 'Commercial Dispatch, Customer ETA & Subcontractor Outbound Line',
    legacyMonthlyCost: 1639,
    monthlyCallVolume: 620,
    monthlySmsVolume: 4800,
    avgBookingValue: 1450,
    recoveredMissedCallsPerMonth: 14,
    marketplaceTollSavedMonthly: 750,
    greeting: 'Thanks for calling Diablo Valley Landscape & Maintenance! I can schedule an estimate, dispatch an irrigation tech, or check your crew ETA.',
    sampleCallerName: 'Marcus Vance (Property Manager)',
    sampleCallerPhone: '(925) 331-7094',
    sampleCallerBadge: 'Commercial Client · Oakwood Business Park · Active Monthly Contract ($4,200/mo)',
    sampleIntent: 'Dispatch irrigation tech to Zone 4 main valve leak tomorrow at 8:00 AM + send work-order link',
    outboundTargetName: 'Horizon Wholesale Nursery (Order Desk)',
    outboundTargetPhone: '(925) 774-2200',
    outboundCampaignType: 'Outbound Supplier Stock Check & Crew Arrival Notification',
    outboundScript: 'Hi Horizon Nursery, calling from Diablo Valley Landscape to confirm delivery window for 45 15-gallon Agonis flexuosa trees to the Oakwood jobsite tomorrow at 7:30 AM.',
    outboundOutcome: 'Answered Live · Confirmed 7:15 AM Jobsite Drop at Gate B & Logged PO #4419',
    depositAmount: 285.00,
    highlight: 'Inbound property-manager dispatch + Outbound nursery/supplier stock verification, crew ETA calls, and open proposal follow-ups.'
  },
  {
    id: 'golf',
    vertical: 'Open Golf Course OS',
    business: 'Oakridge Championship Golf Club',
    phoneNumber: '(512) 555-0164',
    legacyStack: 'Pro Shop Tee Sheet Inbound & Frost-Delay / Tournament Outbound Line',
    legacyMonthlyCost: 2720,
    monthlyCallVolume: 1800,
    monthlySmsVolume: 12000,
    avgBookingValue: 340,
    recoveredMissedCallsPerMonth: 42,
    marketplaceTollSavedMonthly: 2400,
    greeting: 'Welcome to Oakridge Championship Golf Club! I can book a tee time, check course conditions and frost status, or connect you with the Pro Shop.',
    sampleCallerName: 'Harrison Forde',
    sampleCallerPhone: '(512) 774-1920',
    sampleCallerBadge: 'Foursome Captain · 6.4 Handicap Index · Prefers Saturday 7:40 AM–8:20 AM Tee Sheet',
    sampleIntent: 'Book Saturday 7:50 AM foursome at $85/player rate + send cart split link',
    outboundTargetName: 'Saturday Morning Tee Sheet (First 12 Groups)',
    outboundTargetPhone: '(512) 881-4402',
    outboundCampaignType: 'Proactive 30-Minute Frost-Delay & Waitlist Backfill Call',
    outboundScript: 'Good morning from Oakridge Golf Club Pro Shop—letting your 7:50 AM group know we have a 30-minute frost delay this morning; your adjusted tee time is 8:20 AM.',
    outboundOutcome: 'Answered Live · Acknowledged 8:20 AM Adjusted Tee Time & Updated Starter Sheet',
    depositAmount: 340.00,
    highlight: 'Inbound tee-time reservations + Outbound frost-delay notifications, waitlist tee-sheet backfill calls, and member event confirmations.'
  },
  {
    id: 'cpa',
    vertical: 'OpenCPA 2.0',
    business: 'Allworth Advisory & Tax Solutions LLP',
    phoneNumber: '(925) 555-0110',
    legacyStack: 'CPA Partner Advisory Inbound & Missing K-1 / Form 8879 Outbound Follow-Up Line',
    legacyMonthlyCost: 1050,
    monthlyCallVolume: 740,
    monthlySmsVolume: 3900,
    avgBookingValue: 2500,
    recoveredMissedCallsPerMonth: 12,
    marketplaceTollSavedMonthly: 0,
    greeting: 'Thank you for calling Allworth Advisory & Tax Solutions. I can schedule a tax consultation, send a secure document upload link, or check your return status.',
    sampleCallerName: 'Dr. David Nguyen (S-Corp Owner)',
    sampleCallerPhone: '(925) 602-9188',
    sampleCallerBadge: '1120-S + 1040 Client · Q4 PTE Elective Tax Payment Due · Open Books Connected',
    sampleIntent: 'Book 30-min Q4 S-Corp Pass-Through Entity Tax review on Wednesday at 2:00 PM',
    outboundTargetName: 'Elena Vance (1065 Partnership Client)',
    outboundTargetPhone: '(925) 319-7740',
    outboundCampaignType: 'Outbound Form 8879 E-Sign & PTET June 15 Prepayment Reminder Call',
    outboundScript: 'Hello Elena, calling from Allworth Advisory & Tax Solutions to remind you that your California PTET Form 3893 prepayment and Form 8879 e-signature are ready for approval before the deadline.',
    outboundOutcome: 'Answered Live · Verified Identity & Sent 1-Tap Form 8879 E-Sign Link During Call',
    depositAmount: 750.00,
    highlight: 'Inbound client triage + Outbound missing K-1 chases, Form 8879 e-sign completions, and statutory estimated tax payment reminders.'
  },
  {
    id: 'hoa',
    vertical: 'Open HOA',
    business: 'Lucas Ranch Estates Owners Association',
    phoneNumber: '(925) 555-0133',
    legacyStack: 'Resident Concierge Inbound & Board / Vendor / Gate Outbound Line',
    legacyMonthlyCost: 445,
    monthlyCallVolume: 210,
    monthlySmsVolume: 2200,
    avgBookingValue: 285,
    recoveredMissedCallsPerMonth: 6,
    marketplaceTollSavedMonthly: 0,
    greeting: 'Hello, you have reached the Lucas Ranch Estates HOA resident line. I can send an assessment payment link, check architectural status, or log a maintenance issue.',
    sampleCallerName: 'Lot #114 Homeowner',
    sampleCallerPhone: '(925) 518-2209',
    sampleCallerBadge: 'Lot #114 · Good Standing · Gate Transponder #4412 Active',
    sampleIntent: 'Send 1-tap $0.15 Direct Bank ACH link for Q4 Assessment ($285.00) + confirm gate code update',
    outboundTargetName: 'Tri-Valley Gate & Access Systems (Emergency Repair)',
    outboundTargetPhone: '(925) 901-3344',
    outboundCampaignType: 'Outbound Vendor Dispatch & Homeowner Notice Call',
    outboundScript: 'Calling from Lucas Ranch Estates HOA regarding the main north gate hydraulic arm sensor fault—confirming technician dispatch for today before 4:00 PM.',
    outboundOutcome: 'Answered Live · Tech Dispatched for 2:30 PM Today & Work Order #HOA-209 Updated',
    depositAmount: 285.00,
    highlight: 'Inbound 24/7 homeowner helpdesk + Outbound vendor dispatch, gate/water shutoff advisories, and friendly past-due assessment reminders.'
  }
];

export const voicePresets = receptionistPresets;

export const outboundCampaignTemplates = [
  {
    id: 'appt-confirm',
    name: '24-Hour Appointment / Reservation Confirmation Call',
    direction: 'Outbound Voice + Auto-SMS Fallback',
    trigger: '24 hours prior to scheduled appointment or large-party reservation in @openscaffold/schedule',
    description: 'Calls customer to confirm attendance, captures any reschedule request or dietary/clinical note live on the call, and updates the calendar.'
  },
  {
    id: 'recall-outreach',
    name: '6-Month Hygiene / Seasonal Service / Annual Review Recall',
    direction: 'Outbound Voice Campaign',
    trigger: '@openscaffold/crm detects 180 days since last visit or overdue annual review',
    description: 'Places friendly outbound voice call offering two live calendar openings and books the selected slot on the spot.'
  },
  {
    id: 'vendor-dispatch',
    name: 'Vendor, Subcontractor & Purveyor Order / Dispatch Verification',
    direction: 'Outbound Operational Call',
    trigger: 'Work order created or PO delivery window approaching',
    description: 'Calls vendor or subcontractor to confirm ETA, material stock, or emergency dispatch window and logs the transcript.'
  },
  {
    id: 'ar-followup',
    name: 'Friendly Invoice, Retainer & Assessment Payment Follow-Up',
    direction: 'Outbound Voice + Text-to-Pay Link',
    trigger: 'Invoice or assessment 15 days past due in @openscaffold/books',
    description: 'Places courteous outbound reminder call and texts a 1-tap $0.15 Direct Bank ACH payment link while on the line.'
  }
];

export const smsTemplates = [
  {
    id: 'missed-call',
    name: '<2-Second Missed-Call Instant Text-Back',
    trigger: 'Inbound SIP call rings >18s or caller hangs up during peak rush',
    carrierCost: '$0.004 (10DLC Wholesale)',
    conversionRate: '64% reply or tap booking link within 3 minutes',
    bodyTemplate: 'Hi {callerName}, sorry we missed your call at {business}! Tap here to grab a time on our live schedule or reply right to this text: https://openscaffold-voice.vercel.app/#book'
  },
  {
    id: 'confirm-pay',
    name: 'Instant Appointment Confirmation + $0.15 Open Payment Deposit Link',
    trigger: 'Booked via Inbound or Outbound Voice Call, SMS thread, or Web Widget',
    carrierCost: '$0.004 (10DLC Wholesale)',
    conversionRate: '94% confirmed · 78% reduction in no-shows',
    bodyTemplate: 'Confirmed! {callerName}, you are booked at {business} ({intent}). Add to Apple Wallet & complete your {deposit} confirmation with $0.15 Direct Bank Pay: https://open-payment-os.vercel.app/#pay'
  },
  {
    id: 'recall-campaign',
    name: '6-Month Hygiene / Seasonal Service / VIP Table Recall',
    trigger: '@openscaffold/crm detects 180 days since last visit or overdue recall',
    carrierCost: '$0.004 (10DLC Wholesale)',
    conversionRate: '31% direct booking conversion',
    bodyTemplate: 'Hi {callerName}! It has been 6 months since your last visit to {business}. We have Tuesday 10:00 AM or Thursday 2:30 PM open—reply 1 for Tue, 2 for Thu, or suggest any time that works!'
  },
  {
    id: 'google-review',
    name: 'Post-Visit Follow-Up & Feedback Link',
    trigger: '@openscaffold/payment settles checkout or @openscaffold/schedule marks visit complete',
    carrierCost: '$0.004 (10DLC Wholesale)',
    conversionRate: '4.9★ avg rating',
    bodyTemplate: 'Thank you for visiting {business} today, {callerName}! Your receipt is saved in your digital pass: https://openscaffoldlabs.com/#receipt'
  }
];
