export const clone = value => JSON.parse(JSON.stringify(value));

export const architectureLayers = [
  {
    id: 'layer-1',
    number: 'Layer 1',
    title: 'Wholesale Carrier SIP Trunking, Number Porting & WebRTC Softphone',
    replacement: 'Direct Tier-1 Carrier SIP API (Telnyx / Bandwidth — $1.00/mo per Phone Number)',
    legacyTax: '$35–$45/user/month on RingCentral, Nextiva, or 8x8 ($2,500–$5,400/yr)',
    openReceptionistCost: '$1.00/mo per local/toll-free DID + $0.0035/min wholesale SIP voice',
    summary: 'Eliminates per-seat VoIP subscriptions by porting the business main phone number directly onto Tier-1 carrier SIP trunks with browser/iOS/iPad WebRTC softphones and standard Yealink/Poly desk-phone registration.',
    modules: ['Carrier SIP Trunk Router', 'WebRTC Browser/Mobile Softphone', 'E911 & CNAM Caller ID Registry'],
    savingMetric: '$2,400–$5,000/yr saved in per-seat phone bills'
  },
  {
    id: 'layer-2',
    number: 'Layer 2',
    title: '24/7 Sub-400ms Real-Time AI Voice Receptionist (@openscaffold/vi)',
    replacement: 'Native Streaming Voice AI Connected Live to @openscaffold/schedule & CRM',
    legacyTax: '$350–$900/mo for Smith.ai, Ruby Receptionists, Slang.ai, or dental call centers',
    openReceptionistCost: '~$0.02–$0.04/min wholesale streaming voice AI — zero per-call booking fee',
    summary: 'Answers every inbound call on the first ring 24/7/365, greets returning callers by name using @openscaffold/crm caller-ID lookup, answers menu/insurance/service FAQs, and books or reschedules live slots in @openscaffold/schedule.',
    modules: ['@openscaffold/vi Voice Engine', 'CRM Caller-ID Screen-Pop', 'Live Schedule Slot Negotiator'],
    savingMetric: '$4,200–$10,800/yr saved + zero missed after-hours calls'
  },
  {
    id: 'layer-3',
    number: 'Layer 3',
    title: 'Wholesale 10DLC Two-Way SMS & <2-Second Missed-Call Text-Back',
    replacement: 'Direct Campaign Registry 10DLC Carrier Messaging ($0.004 per SMS)',
    legacyTax: '$399–$799/mo for Weave, Podium, RevenueWell, or Solutionreach ($4,800–$9,600/yr)',
    openReceptionistCost: '$0.004 per SMS segment ($4.00 per 1,000 texts!) + $2.00/mo 10DLC campaign',
    summary: 'Replaces $500–$800/mo Weave/Podium contracts with a unified two-way SMS inbox, automated appointment confirmations, 6-month dental/service recall campaigns, and instant <2-second missed-call text-back.',
    modules: ['@openscaffold/messaging v1.1', 'Instant Missed-Call Text-Back', 'Automated Google Review Harvester'],
    savingMetric: '$4,500–$9,200/yr saved vs Weave & Podium'
  },
  {
    id: 'layer-4',
    number: 'Layer 4',
    title: 'Zero-Commission Direct Booking & Marketplace Toll Elimination',
    replacement: 'First-Party Voice/SMS/Web Booking + Google Reserve Direct Integration',
    legacyTax: '$1.00–$1.50/cover on OpenTable, $15k–$40k/yr GolfNow barter rounds, $75+ Zocdoc lead fees',
    openReceptionistCost: '$0.00 per cover, $0.00 per tee time, $0.00 per patient/service lead',
    summary: 'Every phone call, SMS thread, and website tap books directly into the business own @openscaffold/schedule ledger—eliminating third-party marketplace cover fees, barter rounds, and lead tolls.',
    modules: ['@openscaffold/schedule v0.1', 'First-Party Waitlist & Table/Chair Optimizer', 'VIP Apple Wallet Pass Issuer'],
    savingMetric: '$6,000–$36,000/yr saved in marketplace commissions'
  },
  {
    id: 'layer-5',
    number: 'Layer 5',
    title: 'Text-to-Pay Deposit Links & Instant @openscaffold/books Revenue Sync',
    replacement: 'Embedded @openscaffold/payment $0.15 ACH & Apple Pay Links in Every Thread',
    legacyTax: 'No-shows costing 8%–15% of capacity + 2.9% + $0.30 Stripe Payment Link fees',
    openReceptionistCost: '$0.15 flat Bank ACH / $0.22 Regulated Debit deposit links inside SMS & Voice',
    summary: 'When the AI Receptionist books a private dining deposit, crown prep copay, landscape retainer, or HOA clubhouse rental, it texts a 1-tap Open Payment link that clears directly into @openscaffold/books v3.3.',
    modules: ['@openscaffold/payment v1.0', '@openscaffold/esign v1.1', '@openscaffold/books v3.3'],
    savingMetric: 'Cuts no-shows by 78% + saves 80%+ on deposit fees'
  }
];

export const receptionistPresets = [
  {
    id: 'dentist',
    vertical: 'Open Dentist',
    business: 'ClearSight Dental Studio',
    phoneNumber: '(925) 555-0148',
    legacyStack: 'Weave ($499/mo) + Podium Reviews ($399/mo) + RingCentral ($180/mo)',
    legacyMonthlyCost: 1078,
    monthlyCallVolume: 850,
    monthlySmsVolume: 6500,
    avgBookingValue: 680,
    recoveredMissedCallsPerMonth: 18,
    marketplaceTollSavedMonthly: 650,
    greeting: 'Thank you for calling ClearSight Dental Studio! I am Clara, Dr. Nair’s AI scheduling assistant. I see you are calling from a recognized patient number—would you like to book a hygiene recall, check insurance eligibility, or speak with our front desk?',
    sampleCallerName: 'Sarah Jenkins',
    sampleCallerPhone: '(925) 412-8830',
    sampleCallerBadge: 'Existing Patient · Delta Dental PPO Verified · 6-Month Hygiene Due · Prefers Tue/Thu Mornings',
    sampleIntent: 'Book 6-month hygiene cleaning + exam for Thursday at 9:30 AM and text HIPAA/copay link',
    depositAmount: 45.00,
    highlight: 'Replaces $12,936/yr Weave + Podium + RingCentral stack for $31/mo in wholesale carrier cost while recovering 18+ missed new-patient calls/month'
  },
  {
    id: 'restaurant',
    vertical: 'Open Restaurant',
    business: 'Harbor & Hearth Bistro',
    phoneNumber: '(925) 555-0192',
    legacyStack: 'OpenTable Pro ($499/mo + $1,150/mo cover fees) + Slang.ai Phone ($399/mo)',
    legacyMonthlyCost: 2048,
    monthlyCallVolume: 1450,
    monthlySmsVolume: 9200,
    avgBookingValue: 165,
    recoveredMissedCallsPerMonth: 34,
    marketplaceTollSavedMonthly: 1150,
    greeting: 'Good evening, thank you for calling Harbor & Hearth Bistro! I can reserve a table on our heated patio or main dining room, check tonight’s wine pairings, or connect you with our private dining director.',
    sampleCallerName: 'Elena Rostova',
    sampleCallerPhone: '(925) 890-4412',
    sampleCallerBadge: 'Gold VIP · 14 Visits · Shellfish Allergy · Table 12 Window Booth Preference',
    sampleIntent: 'Reserve Table 12 for 4 guests this Friday at 7:15 PM (note shellfish allergy on chef chit)',
    depositAmount: 100.00,
    highlight: 'Eliminates $24,576/yr in OpenTable per-cover tolls and Slang.ai fees while answering 100% of dinner-rush phone calls without pulling the host off the door'
  },
  {
    id: 'landscape',
    vertical: 'Open Landscape Business',
    business: 'Diablo Valley Landscape & Maintenance',
    phoneNumber: '(925) 555-0177',
    legacyStack: 'Podium ($599/mo) + ServiceTitan Phones ($290/mo) + Thumbtack Lead Tolls ($750/mo)',
    legacyMonthlyCost: 1639,
    monthlyCallVolume: 620,
    monthlySmsVolume: 4800,
    avgBookingValue: 1450,
    recoveredMissedCallsPerMonth: 14,
    marketplaceTollSavedMonthly: 750,
    greeting: 'Thanks for calling Diablo Valley Landscape & Maintenance! I am Sage, our dispatch and estimating assistant. Are you calling for a commercial maintenance quote, an irrigation emergency, or an update on your crew schedule?',
    sampleCallerName: 'Marcus Vance (Property Manager)',
    sampleCallerPhone: '(925) 331-7094',
    sampleCallerBadge: 'Commercial Client · Oakwood Business Park · Active Monthly Contract ($4,200/mo)',
    sampleIntent: 'Dispatch irrigation tech to Zone 4 main valve leak tomorrow at 8:00 AM + text work-order approval link',
    depositAmount: 285.00,
    highlight: 'Replaces $19,668/yr Podium + VoIP + lead fees and captures every commercial property manager call while crews are out in the field'
  },
  {
    id: 'golf',
    vertical: 'Open Golf Course OS',
    business: 'Oakridge Championship Golf Club',
    phoneNumber: '(512) 555-0164',
    legacyStack: 'GolfNow Barter Tee Times ($2,400/mo value) + RingCentral ($320/mo)',
    legacyMonthlyCost: 2720,
    monthlyCallVolume: 1800,
    monthlySmsVolume: 12000,
    avgBookingValue: 340,
    recoveredMissedCallsPerMonth: 42,
    marketplaceTollSavedMonthly: 2400,
    greeting: 'Welcome to Oakridge Championship Golf Club! I can book a tee time with zero booking fees, check today’s green speed and frost-delay status, or connect you with the Pro Shop.',
    sampleCallerName: 'Harrison Forde',
    sampleCallerPhone: '(512) 774-1920',
    sampleCallerBadge: 'Foursome Captain · 6.4 Handicap Index · Prefers Saturday 7:40 AM–8:20 AM Tee Sheet',
    sampleIntent: 'Book Saturday 7:50 AM foursome at direct $85/player rate (0% GolfNow commission) + text cart split link',
    depositAmount: 340.00,
    highlight: 'Eliminates $28,800+/yr in GolfNow barter-round giveaways by converting phone and SMS golfers directly onto the club’s own tee sheet'
  },
  {
    id: 'cpa',
    vertical: 'OpenCPA 2.0',
    business: 'Allworth Advisory & Tax Solutions LLP',
    phoneNumber: '(925) 555-0110',
    legacyStack: 'RingCentral ($420/mo) + Smith.ai Receptionist ($450/mo) + Calendly/Texting ($180/mo)',
    legacyMonthlyCost: 1050,
    monthlyCallVolume: 740,
    monthlySmsVolume: 3900,
    avgBookingValue: 2500,
    recoveredMissedCallsPerMonth: 12,
    marketplaceTollSavedMonthly: 0,
    greeting: 'Thank you for calling Allworth Advisory & Tax Solutions. I can schedule a tax planning consultation with Antonio or Michael, text you a secure magic link to upload your K-1s, or check your Form 8879 e-sign status.',
    sampleCallerName: 'Dr. David Nguyen (S-Corp Owner)',
    sampleCallerPhone: '(925) 602-9188',
    sampleCallerBadge: '1120-S + 1040 Client · Q4 PTE Elective Tax Payment Due · Open Books Connected',
    sampleIntent: 'Book 30-min Q4 S-Corp Pass-Through Entity Tax review on Wednesday at 2:00 PM + text retainer link',
    depositAmount: 750.00,
    highlight: 'Replaces $12,600/yr in phones and answering services while triaging tax-season calls and texting secure organizer magic links automatically'
  },
  {
    id: 'hoa',
    vertical: 'Open HOA',
    business: 'Lucas Ranch Estates Owners Association',
    phoneNumber: '(925) 555-0133',
    legacyStack: 'Legacy Property Mgmt Call Center Add-On ($350/mo) + Bulk SMS ($95/mo)',
    legacyMonthlyCost: 445,
    monthlyCallVolume: 210,
    monthlySmsVolume: 2200,
    avgBookingValue: 285,
    recoveredMissedCallsPerMonth: 6,
    marketplaceTollSavedMonthly: 0,
    greeting: 'Hello, you have reached Harbor, the Lucas Ranch Estates HOA resident concierge. I can text you a 1-click $0.15 bank payment link for your assessment, check architectural review status, or report a gate maintenance issue.',
    sampleCallerName: 'Lot #114 Homeowner',
    sampleCallerPhone: '(925) 518-2209',
    sampleCallerBadge: 'Lot #114 · Good Standing · Gate Transponder #4412 Active',
    sampleIntent: 'Text 1-tap $0.15 Direct Bank ACH link for Q4 Assessment ($285.00) + confirm gate code update',
    depositAmount: 285.00,
    highlight: 'Gives self-managed HOAs a 24/7 resident phone & SMS helpdesk for under $12/month in wholesale telecom cost'
  }
];

export const smsTemplates = [
  {
    id: 'missed-call',
    name: '<2-Second Missed-Call Instant Text-Back',
    trigger: 'Inbound SIP call rings >18s or caller hangs up during peak rush',
    carrierCost: '$0.004 (10DLC Wholesale)',
    conversionRate: '64% reply or tap booking link within 3 minutes',
    bodyTemplate: 'Hi {callerName}, sorry we missed your call at {business}! Tap here to grab a time on our live schedule or reply right to this text and our AI concierge will lock it in for you: https://open-receptionist-os.vercel.app/#book'
  },
  {
    id: 'confirm-pay',
    name: 'Instant Appointment Confirmation + $0.15 Open Payment Deposit Link',
    trigger: 'Booked via AI Voice Call, SMS thread, or First-Party Web Widget',
    carrierCost: '$0.004 (10DLC Wholesale)',
    conversionRate: '94% confirmed · 78% reduction in no-shows',
    bodyTemplate: 'Confirmed! {callerName}, you are booked at {business} ({intent}). Add to Apple Wallet & complete your {deposit} confirmation with $0.15 Direct Bank Pay: https://open-payment-os.vercel.app/#pay'
  },
  {
    id: 'recall-campaign',
    name: '6-Month Hygiene / Seasonal Service / VIP Table Recall',
    trigger: '@openscaffold/crm detects 180 days since last visit or overdue recall',
    carrierCost: '$0.004 (10DLC Wholesale)',
    conversionRate: '31% direct booking conversion ($0 ad spend)',
    bodyTemplate: 'Hi {callerName}! It has been 6 months since your last visit to {business}. We have Tuesday 10:00 AM or Thursday 2:30 PM open—reply 1 for Tue, 2 for Thu, or suggest any time that works!'
  },
  {
    id: 'google-review',
    name: 'Post-Visit 5-Star Google Review & VIP Wallet Enroller',
    trigger: '@openscaffold/payment settles checkout or @openscaffold/schedule marks visit complete',
    carrierCost: '$0.004 (10DLC Wholesale)',
    conversionRate: '4.9★ avg rating · +28 new Google reviews/month',
    bodyTemplate: 'Thank you for visiting {business} today, {callerName}! Your receipt is saved in your VIP pass. If you loved your experience, a quick 15-second Google review means the world to our team: https://openscaffoldlabs.com/#review'
  }
];
