import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NIRIKSHAN AI synthetic seed generation...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.videoVerification.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.anomaly.deleteMany();
  await prisma.camera.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // ==========================================
  // 1. SEED 4 DEMO USERS
  // ==========================================
  const official = await prisma.user.create({
    data: {
      id: 'usr-official-001',
      name: 'Dr. Rajesh Sharma (Director - Monitoring)',
      role: 'OFFICIAL',
      phone: '+919876543210',
      email: 'official@dosje.gov.in',
      state: 'Delhi',
      district: 'New Delhi',
      active: true,
    },
  });

  const inspector = await prisma.user.create({
    data: {
      id: 'usr-inspector-001',
      name: 'Priya Verma (Senior Field PMU Officer)',
      role: 'INSPECTOR',
      phone: '+919876543211',
      email: 'inspector@pmu.gov.in',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      active: true,
    },
  });

  const inspector2 = await prisma.user.create({
    data: {
      id: 'usr-inspector-002',
      name: 'Vikramjit Singh (State Inspection Lead)',
      role: 'INSPECTOR',
      phone: '+919876543214',
      email: 'vikram.singh@pmu.gov.in',
      state: 'Punjab',
      district: 'Ludhiana',
      active: true,
    },
  });

  const ngoIncharge = await prisma.user.create({
    data: {
      id: 'usr-ngo-001',
      name: 'Amit Sundaram (Managing Trustee)',
      role: 'NGO',
      phone: '+919876543212',
      email: 'incharge@welfaretrust.org',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      active: true,
    },
  });

  const beneficiary = await prisma.user.create({
    data: {
      id: 'usr-beneficiary-001',
      name: 'Ramesh Kumar (Registered Beneficiary)',
      role: 'BENEFICIARY',
      phone: '+919876543213',
      email: 'ramesh.kumar@beneficiary.in',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      active: true,
    },
  });

  console.log('✅ Created 5 seeded users (Official, 2 Inspectors, NGO In-charge, Beneficiary).');

  // ==========================================
  // 2. SEED 12 SYNTHETIC PROJECTS
  // ==========================================
  const projectsData = [
    {
      id: 'proj-001',
      name: 'Demo Welfare Institute - Coimbatore',
      scheme: 'DoSJE Integrated De-addiction Scheme',
      type: 'Rehabilitation Centre',
      organization: 'Hope Foundation Trust',
      address: '42 Avinashi Road, Peelamedu, Coimbatore',
      latitude: 11.0267,
      longitude: 76.9953,
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      capacity: 100,
      beneficiaryCount: 92,
      staffCount: 14,
      riskScore: 82,
      riskLevel: 'HIGH',
      status: 'UNDER_INVESTIGATION',
    },
    {
      id: 'proj-002',
      name: 'Demo Senior Care Sanctuary - Chennai',
      scheme: 'DoSJE Senior Citizens Care Scheme',
      type: 'Old Age Home',
      organization: 'Anbu Karangal Mission',
      address: '15 GST Road, Guindy, Chennai',
      latitude: 13.0067,
      longitude: 80.2023,
      state: 'Tamil Nadu',
      district: 'Chennai',
      capacity: 60,
      beneficiaryCount: 54,
      staffCount: 8,
      riskScore: 24,
      riskLevel: 'LOW',
      status: 'ACTIVE',
    },
    {
      id: 'proj-003',
      name: 'Demo De-addiction Kendra - Ludhiana',
      scheme: 'National Action Plan for Drug Demand Reduction (NAPDDR)',
      type: 'De-addiction Centre',
      organization: 'Jeevan Jyoti Society',
      address: '88 Ferozepur Road, Ludhiana',
      latitude: 30.9010,
      longitude: 75.8573,
      state: 'Punjab',
      district: 'Ludhiana',
      capacity: 80,
      beneficiaryCount: 78,
      staffCount: 11,
      riskScore: 68,
      riskLevel: 'HIGH',
      status: 'ACTIVE',
    },
    {
      id: 'proj-004',
      name: 'Demo Skill Academy for Divyangjan - Bhopal',
      scheme: 'DoSJE National Divyangjan Empowerment Scheme',
      type: 'Vocational Training Centre',
      organization: 'Samarthya Welfare Council',
      address: '22 Link Road No. 1, Bhopal',
      latitude: 23.2599,
      longitude: 77.4126,
      state: 'Madhya Pradesh',
      district: 'Bhopal',
      capacity: 120,
      beneficiaryCount: 115,
      staffCount: 18,
      riskScore: 45,
      riskLevel: 'MEDIUM',
      status: 'ACTIVE',
    },
    {
      id: 'proj-005',
      name: 'Demo Rehabilitation Centre - Lucknow',
      scheme: 'DoSJE Substance Abuse Rehabilitation Initiative',
      type: 'Rehabilitation Centre',
      organization: 'Naya Savera Foundation',
      address: '14 Hazratganj, Lucknow',
      latitude: 26.8467,
      longitude: 80.9462,
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      capacity: 70,
      beneficiaryCount: 65,
      staffCount: 9,
      riskScore: 89,
      riskLevel: 'CRITICAL',
      status: 'FLAGGED',
    },
    {
      id: 'proj-006',
      name: 'Demo Assisted Living Home - Pune',
      scheme: 'DoSJE Scheme for Integrated Care of Elderly',
      type: 'Old Age Home',
      organization: 'Seva Sadan Sanstha',
      address: '5 Kothrud Stand Road, Pune',
      latitude: 18.5074,
      longitude: 73.8077,
      state: 'Maharashtra',
      district: 'Pune',
      capacity: 50,
      beneficiaryCount: 48,
      staffCount: 7,
      riskScore: 18,
      riskLevel: 'LOW',
      status: 'ACTIVE',
    },
    {
      id: 'proj-007',
      name: 'Demo Children Care & Support Home - Jaipur',
      scheme: 'DoSJE Child Protection & Support Action Plan',
      type: 'Children Home',
      organization: 'Udaan Bal Vikas Trust',
      address: '33 Tonk Road, Jaipur',
      latitude: 26.8851,
      longitude: 75.7906,
      state: 'Rajasthan',
      district: 'Jaipur',
      capacity: 90,
      beneficiaryCount: 88,
      staffCount: 12,
      riskScore: 52,
      riskLevel: 'MEDIUM',
      status: 'ACTIVE',
    },
    {
      id: 'proj-008',
      name: 'Demo Divyang Empowerment Centre - Bengaluru',
      scheme: 'DoSJE Accessible India Mission Support',
      type: 'Empowerment Hostel',
      organization: 'Prajna Jyothi Mission',
      address: '104 Indiranagar 100ft Road, Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      capacity: 85,
      beneficiaryCount: 82,
      staffCount: 10,
      riskScore: 12,
      riskLevel: 'LOW',
      status: 'ACTIVE',
    },
    {
      id: 'proj-009',
      name: 'Demo Halfway Home & Counseling Hub - Guwahati',
      scheme: 'National Action Plan for Social Defence',
      type: 'Halfway Home',
      organization: 'Pragjyotish Welfare Forum',
      address: '19 GS Road, Dispur, Guwahati',
      latitude: 26.1445,
      longitude: 91.7362,
      state: 'Assam',
      district: 'Kamrup Metropolitan',
      capacity: 45,
      beneficiaryCount: 42,
      staffCount: 6,
      riskScore: 74,
      riskLevel: 'HIGH',
      status: 'UNDER_INVESTIGATION',
    },
    {
      id: 'proj-0010',
      name: 'Demo SC/OBC Youth Residential Hostel - Patna',
      scheme: 'DoSJE Babu Jagjivan Ram Chhatrawas Yojana',
      type: 'Student Hostel',
      organization: 'Jagriti Shiksha Sansthan',
      address: '7 Bailey Road, Patna',
      latitude: 25.5941,
      longitude: 85.1376,
      state: 'Bihar',
      district: 'Patna',
      capacity: 150,
      beneficiaryCount: 146,
      staffCount: 15,
      riskScore: 38,
      riskLevel: 'MEDIUM',
      status: 'ACTIVE',
    },
    {
      id: 'proj-0011',
      name: 'Demo Senior Citizen Care Haven - Kolkata',
      scheme: 'DoSJE Atal Vayo Abhyuday Yojana (AVYAY)',
      type: 'Old Age Home',
      organization: 'Shanti Niketan Seva Parishad',
      address: '56 Rashbehari Avenue, Kolkata',
      latitude: 22.5186,
      longitude: 88.3582,
      state: 'West Bengal',
      district: 'Kolkata',
      capacity: 75,
      beneficiaryCount: 71,
      staffCount: 9,
      riskScore: 21,
      riskLevel: 'LOW',
      status: 'ACTIVE',
    },
    {
      id: 'proj-0012',
      name: 'Demo Drug De-addiction & Counseling - Ahmedabad',
      scheme: 'NAPDDR State Action Plan',
      type: 'De-addiction Centre',
      organization: 'Navchetna Jan Kalyan Trust',
      address: '78 Ashram Road, Ahmedabad',
      latitude: 23.0300,
      longitude: 72.5800,
      state: 'Gujarat',
      district: 'Ahmedabad',
      capacity: 80,
      beneficiaryCount: 76,
      staffCount: 12,
      riskScore: 84,
      riskLevel: 'HIGH',
      status: 'ACTIVE',
    },
  ];

  for (const p of projectsData) {
    await prisma.project.create({ data: p });
  }

  console.log(`✅ Created ${projectsData.length} synthetic projects.`);

  // ==========================================
  // 3. SEED ATTENDANCE RECORDS (With Discrepancy Scenarios)
  // ==========================================
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Proj-001 (Attendance Mismatch Demo Scenario)
  await prisma.attendance.createMany({
    data: [
      {
        projectId: 'proj-001',
        date: now,
        reportedCount: 92,
        observedCount: 61,
        source: 'PORTAL_SUBMISSION',
        mismatchPercentage: 33.7,
      },
      {
        projectId: 'proj-001',
        date: yesterday,
        reportedCount: 92,
        observedCount: 60,
        source: 'PORTAL_SUBMISSION',
        mismatchPercentage: 34.8,
      },
      {
        projectId: 'proj-001',
        date: twoDaysAgo,
        reportedCount: 92,
        observedCount: 63,
        source: 'PORTAL_SUBMISSION',
        mismatchPercentage: 31.5,
      },
      // Proj-002 (Normal healthy attendance)
      {
        projectId: 'proj-002',
        date: now,
        reportedCount: 54,
        observedCount: 52,
        source: 'PORTAL_SUBMISSION',
        mismatchPercentage: 3.7,
      },
      // Proj-005 (Capacity Exceeded Anomaly)
      {
        projectId: 'proj-005',
        date: now,
        reportedCount: 88, // Registered capacity is only 70!
        observedCount: 45,
        source: 'PORTAL_SUBMISSION',
        mismatchPercentage: 48.9,
      },
    ],
  });

  console.log('✅ Created attendance records including mismatch & capacity exceeded cases.');

  // ==========================================
  // 4. SEED 10 CCTV CAMERAS (With Online/Offline status)
  // ==========================================
  const cameraList = [
    {
      id: 'cam-001',
      projectId: 'proj-001',
      name: 'Main Entrance Gate',
      location: 'Perimeter Gate 1',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/coimbatore-gate1.m3u8',
      status: 'ONLINE',
      lastHeartbeat: new Date(),
      streamQuality: '1080p / 25fps',
      peopleCount: 8,
      lastDetectedActivity: 'Person entered through turnstile',
    },
    {
      id: 'cam-002',
      projectId: 'proj-001',
      name: 'Dining & Common Hall',
      location: 'Block A Ground Floor',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/coimbatore-dining.m3u8',
      status: 'ONLINE',
      lastHeartbeat: new Date(),
      streamQuality: '1080p / 25fps',
      peopleCount: 42,
      lastDetectedActivity: 'Meal distribution in progress',
    },
    {
      id: 'cam-003',
      projectId: 'proj-001',
      name: 'Dormitory Corridor East',
      location: 'Block B First Floor',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/coimbatore-dorm.m3u8',
      status: 'ONLINE',
      lastHeartbeat: new Date(),
      streamQuality: '720p / 20fps',
      peopleCount: 11,
      lastDetectedActivity: 'Hallway movement',
    },
    // Proj-003 (CCTV Offline Demo Scenario)
    {
      id: 'cam-004',
      projectId: 'proj-003',
      name: 'Ward 2 Rehabilitation Hall',
      location: 'Main Building Wing C',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/ludhiana-ward2.m3u8',
      status: 'OFFLINE',
      lastHeartbeat: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago!
      streamQuality: 'No Signal',
      peopleCount: 0,
      lastDetectedActivity: 'Signal lost during working hours',
    },
    {
      id: 'cam-005',
      projectId: 'proj-002',
      name: 'Main Activity Area',
      location: 'Courtyard Pavilion',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/chennai-courtyard.m3u8',
      status: 'ONLINE',
      lastHeartbeat: new Date(),
      streamQuality: '1080p / 30fps',
      peopleCount: 28,
      lastDetectedActivity: 'Physiotherapy group session',
    },
    {
      id: 'cam-006',
      projectId: 'proj-004',
      name: 'Vocational Workshop 1',
      location: 'Skill Wing Ground Floor',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/bhopal-workshop.m3u8',
      status: 'ONLINE',
      lastHeartbeat: new Date(),
      streamQuality: '1080p / 25fps',
      peopleCount: 35,
      lastDetectedActivity: 'Handicraft training ongoing',
    },
    {
      id: 'cam-007',
      projectId: 'proj-005',
      name: 'Consultation & Clinic Room',
      location: 'Medical Wing',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/lucknow-clinic.m3u8',
      status: 'DELAYED',
      lastHeartbeat: new Date(now.getTime() - 15 * 60 * 1000),
      streamQuality: '480p / 10fps',
      peopleCount: 4,
      lastDetectedActivity: 'Bandwidth throttling detected',
    },
    {
      id: 'cam-008',
      projectId: 'proj-009',
      name: 'Entrance & Registration Desk',
      location: 'Front Foyer',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/guwahati-foyer.m3u8',
      status: 'ONLINE',
      lastHeartbeat: new Date(),
      streamQuality: '1080p / 25fps',
      peopleCount: 15,
      lastDetectedActivity: 'Visitor registration',
    },
    {
      id: 'cam-009',
      projectId: 'proj-0012',
      name: 'Recreation Hall',
      location: 'North Block',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/ahmedabad-hall.m3u8',
      status: 'OFFLINE',
      lastHeartbeat: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      streamQuality: 'No Signal',
      peopleCount: 0,
      lastDetectedActivity: 'Camera disconnected unexpectedly',
    },
    {
      id: 'cam-0010',
      projectId: 'proj-007',
      name: 'Study & Library Room',
      location: 'Academic Block Floor 2',
      streamUrl: 'https://demo-cctv.sih26095.local/streams/jaipur-library.m3u8',
      status: 'ONLINE',
      lastHeartbeat: new Date(),
      streamQuality: '1080p / 25fps',
      peopleCount: 40,
      lastDetectedActivity: 'Evening study hours',
    },
  ];

  for (const c of cameraList) {
    await prisma.camera.create({ data: c });
  }

  console.log(`✅ Created ${cameraList.length} CCTV cameras with telemetry.`);

  // ==========================================
  // 5. SEED 15 EXPLAINABLE ANOMALIES (ALERTS)
  // ==========================================
  const anomaliesData = [
    {
      id: 'anom-001',
      projectId: 'proj-001',
      type: 'ATTENDANCE_CCTV_MISMATCH',
      severity: 'HIGH',
      riskScore: 82,
      scoreBreakdown: JSON.stringify([
        { factor: 'Attendance discrepancy > 30%', points: 35 },
        { factor: 'Repeated static attendance count for 3 days', points: 15 },
        { factor: 'Previous unresolved observation', points: 12 },
        { factor: 'Peak operational hour divergence', points: 20 },
      ]),
      explanation:
        'Reported attendance was 92 beneficiaries, but automated camera computer-vision estimates observed only ~61 unique individuals during peak lunch hours (33.7% mismatch).',
      evidenceIds: JSON.stringify(['cam-001', 'cam-002']),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'anom-002',
      projectId: 'proj-003',
      type: 'CCTV_OFFLINE_DURING_EXPECTED_HOURS',
      severity: 'HIGH',
      riskScore: 68,
      scoreBreakdown: JSON.stringify([
        { factor: 'Primary camera offline during required hours (09:00 - 18:00)', points: 40 },
        { factor: 'No prior maintenance ticket submitted', points: 18 },
        { factor: 'High-risk scheme project tier', points: 10 },
      ]),
      explanation:
        'Camera "Ward 2 Rehabilitation Hall" stopped transmitting heartbeats 4 hours ago during mandatory scheme operating hours without prior downtime notification.',
      evidenceIds: JSON.stringify(['cam-004']),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      id: 'anom-003',
      projectId: 'proj-005',
      type: 'ATTENDANCE_CAPACITY_EXCEEDED',
      severity: 'CRITICAL',
      riskScore: 89,
      scoreBreakdown: JSON.stringify([
        { factor: 'Reported attendance exceeds sanction capacity by 25.7%', points: 45 },
        { factor: 'CCTV observation shows only 45 persons present', points: 30 },
        { factor: 'Repeated claim irregularities in prior quarter', points: 14 },
      ]),
      explanation:
        'Registered facility capacity is 70 beds, but NGO reported 88 active beneficiaries. Video analytics observe only ~45 attendees.',
      evidenceIds: JSON.stringify(['cam-007']),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
    {
      id: 'anom-004',
      projectId: 'proj-0012',
      type: 'DUPLICATE_EVIDENCE',
      severity: 'HIGH',
      riskScore: 84,
      scoreBreakdown: JSON.stringify([
        { factor: 'Exact SHA-256 hash match with historical inspection file', points: 50 },
        { factor: 'Perceptual similarity index = 98.4%', points: 20 },
        { factor: 'Different inspection timestamps for identical file', points: 14 },
      ]),
      explanation:
        'Submitted photo evidence "dining_hall_meal.jpg" matches a photograph submitted 45 days ago in another quarterly inspection report.',
      evidenceIds: JSON.stringify(['evid-001']),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
    {
      id: 'anom-005',
      projectId: 'proj-009',
      type: 'INSPECTOR_GPS_MISMATCH',
      severity: 'HIGH',
      riskScore: 74,
      scoreBreakdown: JSON.stringify([
        { factor: 'Inspector verified location is 420m outside registered geofence', points: 40 },
        { factor: 'Inspection report submitted despite geofence violation', points: 25 },
        { factor: 'Elevation and coordinate mismatch', points: 9 },
      ]),
      explanation:
        'Inspector attempted report submission while GPS coordinates were 420 meters away from registered boundary. System flagged geofence breach.',
      evidenceIds: JSON.stringify([]),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
    },
    {
      id: 'anom-006',
      projectId: 'proj-001',
      type: 'REPEATED_ATTENDANCE_PATTERN',
      severity: 'MEDIUM',
      riskScore: 48,
      scoreBreakdown: JSON.stringify([
        { factor: 'Exact 92 beneficiaries reported 5 days consecutively', points: 25 },
        { factor: 'Zero variation in weekday vs weekend headcounts', points: 23 },
      ]),
      explanation:
        'Daily submitted attendance has remained frozen at exactly 92 for 5 consecutive reporting cycles with zero standard deviation.',
      evidenceIds: JSON.stringify([]),
      status: 'REVIEWED',
      reviewedBy: 'Dr. Rajesh Sharma',
      reviewNotes: 'Surprise inspection recommended to verify physical head-count.',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'anom-007',
      projectId: 'proj-004',
      type: 'MISSED_VIDEO_VERIFICATION',
      severity: 'MEDIUM',
      riskScore: 45,
      scoreBreakdown: JSON.stringify([
        { factor: 'Surprise video verification call unanswered after 3 attempts', points: 30 },
        { factor: 'No call-back received within 60 minutes', points: 15 },
      ]),
      explanation:
        'Official-initiated surprise verification call to Project In-charge went unanswered during standard working hours.',
      evidenceIds: JSON.stringify([]),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
    },
    {
      id: 'anom-008',
      projectId: 'proj-007',
      type: 'OVERDUE_INSPECTION',
      severity: 'MEDIUM',
      riskScore: 52,
      scoreBreakdown: JSON.stringify([
        { factor: '184 days since last physical PMU inspection (limit: 180 days)', points: 35 },
        { factor: 'Child residential care high-priority classification', points: 17 },
      ]),
      explanation:
        'Physical surprise verification overdue by 4 days according to mandatory DoSJE semi-annual inspection cycle guidelines.',
      evidenceIds: JSON.stringify([]),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
    },
    {
      id: 'anom-009',
      projectId: 'proj-0010',
      type: 'SUDDEN_BEHAVIOR_CHANGE',
      severity: 'MEDIUM',
      riskScore: 38,
      scoreBreakdown: JSON.stringify([
        { factor: 'Sudden 38% drop in reported meal provision counts', points: 25 },
        { factor: 'No festival or exam leave documented', points: 13 },
      ]),
      explanation:
        'Food consumption and meal attendance dropped sharply from 146 to 90 without corresponding official leave approval.',
      evidenceIds: JSON.stringify([]),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    },
    {
      id: 'anom-010',
      projectId: 'proj-003',
      type: 'ATTENDANCE_CCTV_MISMATCH',
      severity: 'HIGH',
      riskScore: 68,
      scoreBreakdown: JSON.stringify([
        { factor: 'Reported 78 vs observed 50 (35.9% discrepancy)', points: 40 },
        { factor: 'Absence of medical officer noted during CCTV review', points: 28 },
      ]),
      explanation:
        'Observed staff and patient movement does not correlate with submitted payroll and beneficiary claims.',
      evidenceIds: JSON.stringify([]),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 52 * 60 * 60 * 1000),
    },
    {
      id: 'anom-011',
      projectId: 'proj-005',
      type: 'CCTV_OFFLINE_DURING_EXPECTED_HOURS',
      severity: 'CRITICAL',
      riskScore: 89,
      scoreBreakdown: JSON.stringify([
        { factor: 'Clinic room camera delayed and offline intermittently', points: 45 },
        { factor: 'Repeated night-time blackout periods', points: 44 },
      ]),
      explanation:
        'Medical consultation camera repeatedly drops connection between 14:00 and 17:00 when doctor rounds are scheduled.',
      evidenceIds: JSON.stringify(['cam-007']),
      status: 'ESCALATED',
      reviewedBy: 'Dr. Rajesh Sharma',
      reviewNotes: 'Escalated to State Directorate for immediate physical audit.',
      createdAt: new Date(now.getTime() - 60 * 60 * 60 * 1000),
    },
    {
      id: 'anom-012',
      projectId: 'proj-0012',
      type: 'CCTV_OFFLINE_DURING_EXPECTED_HOURS',
      severity: 'HIGH',
      riskScore: 84,
      scoreBreakdown: JSON.stringify([
        { factor: 'Recreation camera offline > 8 hours', points: 40 },
        { factor: 'Lack of telemetry ping reply', points: 24 },
        { factor: 'Previous warning issued', points: 20 },
      ]),
      explanation:
        'Recreation Hall camera has been offline continuously since 08:00 AM without automated heartbeat restoration.',
      evidenceIds: JSON.stringify(['cam-009']),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    },
    {
      id: 'anom-013',
      projectId: 'proj-002',
      type: 'REPEATED_ATTENDANCE_PATTERN',
      severity: 'LOW',
      riskScore: 24,
      scoreBreakdown: JSON.stringify([
        { factor: 'Minor pattern conformity across weekend dates', points: 14 },
        { factor: 'Within acceptable statistical tolerance', points: 10 },
      ]),
      explanation:
        'Slight weekend variance noted; within acceptable parameters for residential senior citizen home.',
      evidenceIds: JSON.stringify([]),
      status: 'FALSE_POSITIVE',
      reviewedBy: 'Dr. Rajesh Sharma',
      reviewNotes: 'Verified genuine through telephonic check.',
      createdAt: new Date(now.getTime() - 84 * 60 * 60 * 1000),
    },
    {
      id: 'anom-014',
      projectId: 'proj-008',
      type: 'OVERDUE_INSPECTION',
      severity: 'LOW',
      riskScore: 12,
      scoreBreakdown: JSON.stringify([
        { factor: 'Routine inspection due in 14 days', points: 12 },
      ]),
      explanation:
        'Scheduled periodic verification window approaching for Divyang hostel.',
      evidenceIds: JSON.stringify([]),
      status: 'OPEN',
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(now.getTime() - 96 * 60 * 60 * 1000),
    },
    {
      id: 'anom-015',
      projectId: 'proj-006',
      type: 'ATTENDANCE_CCTV_MISMATCH',
      severity: 'LOW',
      riskScore: 18,
      scoreBreakdown: JSON.stringify([
        { factor: 'Temporary 5% difference during morning prayer session', points: 18 },
      ]),
      explanation:
        'Minor 2-person difference between gate counter and garden camera; confirmed inside temple room.',
      evidenceIds: JSON.stringify([]),
      status: 'FALSE_POSITIVE',
      reviewedBy: 'Dr. Rajesh Sharma',
      reviewNotes: 'Resolved as false positive.',
      createdAt: new Date(now.getTime() - 110 * 60 * 60 * 1000),
    },
  ];

  for (const a of anomaliesData) {
    await prisma.anomaly.create({ data: a });
  }

  console.log(`✅ Created ${anomaliesData.length} explainable anomalies (alerts).`);

  // ==========================================
  // 6. SEED INSPECTIONS & FIELD EVIDENCE
  // ==========================================
  const inspection1 = await prisma.inspection.create({
    data: {
      id: 'insp-001',
      projectId: 'proj-001',
      inspectorId: inspector.id,
      type: 'SURPRISE_PHYSICAL',
      assignedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      completedAt: null,
      status: 'IN_PROGRESS',
      latitude: 11.0268,
      longitude: 76.9952,
      locationVerified: true,
      checklistData: JSON.stringify({
        projectOperational: true,
        staffPresent: true,
        beneficiariesPresentCount: 63,
        cctvFunctional: true,
        fireSafetyCompliant: true,
        kitchenHygieneSatisfactory: true,
        registersMaintained: false,
      }),
      reportNotes:
        'Initial spot physical headcount indicates ~63 beneficiaries present on-site. Attendance register showed 92 entries. Further cross-verification underway.',
      syncStatus: 'SYNCED',
    },
  });

  const inspection2 = await prisma.inspection.create({
    data: {
      id: 'insp-002',
      projectId: 'proj-002',
      inspectorId: inspector.id,
      type: 'ROUTINE',
      assignedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 3600000),
      completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 7200000),
      status: 'COMPLETED',
      latitude: 13.0068,
      longitude: 80.2024,
      locationVerified: true,
      checklistData: JSON.stringify({
        projectOperational: true,
        staffPresent: true,
        beneficiariesPresentCount: 52,
        cctvFunctional: true,
        fireSafetyCompliant: true,
        kitchenHygieneSatisfactory: true,
        registersMaintained: true,
      }),
      reportNotes: 'Routine audit satisfactory. Verified physical records and facilities.',
      syncStatus: 'SYNCED',
    },
  });

  // Seed Evidence items with SHA-256 hashes
  await prisma.evidence.createMany({
    data: [
      {
        id: 'evid-001',
        inspectionId: inspection1.id,
        projectId: 'proj-001',
        type: 'PHOTO',
        fileUrl: 'https://demo-storage.sih26095.local/evidence/insp001_dining_headcount.jpg',
        latitude: 11.02675,
        longitude: 76.99532,
        capturedAt: new Date(now.getTime() - 100 * 60 * 1000),
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        perceptualHash: 'd41d8cd98f00b204e9800998ecf8427e',
        integrityStatus: 'VERIFIED',
        metadata: JSON.stringify({
          deviceModel: 'Pixel 8 Pro (Inspector Edition)',
          accuracyMeters: 3.2,
          orientation: 'Landscape',
        }),
      },
      {
        id: 'evid-002',
        inspectionId: inspection1.id,
        projectId: 'proj-001',
        type: 'VOICE_NOTE',
        fileUrl: 'https://demo-storage.sih26095.local/evidence/insp001_audio_statement.m4a',
        latitude: 11.02678,
        longitude: 76.99530,
        capturedAt: new Date(now.getTime() - 80 * 60 * 1000),
        hash: 'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2',
        perceptualHash: null,
        integrityStatus: 'VERIFIED',
        metadata: JSON.stringify({
          durationSeconds: 45,
          recordedBy: 'Priya Verma',
        }),
      },
      {
        id: 'evid-003',
        inspectionId: inspection2.id,
        projectId: 'proj-002',
        type: 'PHOTO',
        fileUrl: 'https://demo-storage.sih26095.local/evidence/insp002_medical_ward.jpg',
        latitude: 13.00672,
        longitude: 80.20235,
        capturedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 4000000),
        hash: 'c8fee37533bc938923a516ec519c72e42d72ee83c4fae8964e5ea2be3b2ff288',
        perceptualHash: 'b5a6c38210f948a27d190184b2c019a3',
        integrityStatus: 'VERIFIED',
        metadata: JSON.stringify({
          deviceModel: 'Samsung Galaxy A54',
          accuracyMeters: 4.1,
        }),
      },
    ],
  });

  console.log('✅ Created inspections and geo-tagged evidence with SHA-256 hashes.');

  // ==========================================
  // 7. SEED VIDEO VERIFICATIONS
  // ==========================================
  await prisma.videoVerification.createMany({
    data: [
      {
        id: 'vc-001',
        projectId: 'proj-001',
        participantType: 'BENEFICIARY',
        participantId: beneficiary.id,
        participantName: beneficiary.name,
        participantPhone: beneficiary.phone,
        requestedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        answeredAt: new Date(now.getTime() - 5 * 60 * 60 * 1000 + 45000),
        status: 'ANSWERED',
        result: 'VERIFIED',
        feedbackNotes:
          'Beneficiary confirmed receiving daily food and vocational training. Mentioned doctor visits 3 times a week.',
        sentiment: 'POSITIVE',
      },
      {
        id: 'vc-002',
        projectId: 'proj-004',
        participantType: 'INCHARGE',
        participantId: 'usr-ngo-004',
        participantName: 'Dinesh Malviya',
        participantPhone: '+919876543299',
        requestedAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
        answeredAt: null,
        status: 'MISSED',
        result: 'UNREACHABLE',
        feedbackNotes: 'Call not picked up after ringing for 60 seconds.',
        sentiment: null,
      },
    ],
  });

  console.log('✅ Created video verification sessions (Answered & Missed).');

  // ==========================================
  // 8. SEED NOTIFICATIONS
  // ==========================================
  await prisma.notification.createMany({
    data: [
      {
        id: 'notif-001',
        userId: official.id,
        type: 'HIGH_RISK_ALERT',
        title: 'High Attendance Discrepancy Flagged',
        message: 'Demo Welfare Institute - Coimbatore reported 92 attendees vs 61 observed by CCTV.',
        read: false,
        metadata: JSON.stringify({ projectId: 'proj-001', anomalyId: 'anom-001' }),
      },
      {
        id: 'notif-002',
        userId: official.id,
        type: 'CCTV_OFFLINE',
        title: 'Camera Outage Alert',
        message: 'Ward 2 Rehabilitation Hall in Ludhiana offline for over 4 hours.',
        read: false,
        metadata: JSON.stringify({ projectId: 'proj-003', cameraId: 'cam-004' }),
      },
      {
        id: 'notif-003',
        userId: inspector.id,
        type: 'SURPRISE_ASSIGNMENT',
        title: 'Surprise Physical Inspection Assigned',
        message: 'You have been randomly selected for surprise verification at Demo Welfare Institute.',
        read: true,
        metadata: JSON.stringify({ inspectionId: 'insp-001', projectId: 'proj-001' }),
      },
    ],
  });

  console.log('✅ Created system notifications.');

  // ==========================================
  // 9. SEED AUDIT TRAIL LOGS
  // ==========================================
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'audit-001',
        actorId: official.id,
        action: 'VIEWED_OFFICIAL_DASHBOARD',
        entityType: 'DASHBOARD',
        entityId: 'overview',
        metadata: JSON.stringify({ viewMode: 'NATIONAL_SUMMARY' }),
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        id: 'audit-002',
        actorId: official.id,
        action: 'TRIGGERED_SURPRISE_INSPECTION',
        entityType: 'PROJECT',
        entityId: 'proj-001',
        metadata: JSON.stringify({
          reason: 'Attendance mismatch 33.7%',
          assignedInspectorId: inspector.id,
          selectionMode: 'CONTROLLED_RANDOM_PRIORITY',
        }),
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'audit-003',
        actorId: inspector.id,
        action: 'VERIFIED_GEOFENCE_LOCATION',
        entityType: 'INSPECTION',
        entityId: 'insp-001',
        metadata: JSON.stringify({
          distanceMeters: 43.2,
          radiusMeters: 100,
          status: 'LOCATION_VERIFIED',
        }),
        timestamp: new Date(now.getTime() - 105 * 60 * 1000),
      },
      {
        id: 'audit-004',
        actorId: inspector.id,
        action: 'UPLOADED_HASHED_EVIDENCE',
        entityType: 'EVIDENCE',
        entityId: 'evid-001',
        metadata: JSON.stringify({
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          integrity: 'VERIFIED',
        }),
        timestamp: new Date(now.getTime() - 100 * 60 * 1000),
      },
      {
        id: 'audit-005',
        actorId: official.id,
        action: 'INITIATED_RANDOM_VC',
        entityType: 'VIDEO_VERIFICATION',
        entityId: 'vc-001',
        metadata: JSON.stringify({
          participantRole: 'BENEFICIARY',
          result: 'VERIFIED',
        }),
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created audit trail event logs.');
  console.log('🎉 Seed generation complete! All tables populated with high-fidelity synthetic demo data.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
