import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { UserPreferences } from '../models/UserPreferences';
import { DailyPlan } from '../models/DailyPlan';
import { CommunityReport } from '../models/CommunityReport';
import { config } from '../config/env';

export const seedDatabase = async () => {
  console.log('🌱 Starting BreatheWise demo seed...');
  try {
    await mongoose.connect(config.mongodbUri);
    console.log(' Connected to MongoDB Atlas / Local');

    // 1. Seed Demo User
    const demoEmail = 'demo@breathewise.in';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash('Demo@2026', salt);

      demoUser = await User.create({
        name: 'Aarav Sharma (Demo)',
        email: demoEmail,
        passwordHash,
        role: 'user',
        location: {
          city: 'New Delhi',
          state: 'Delhi',
          latitude: 28.6139,
          longitude: 77.2090,
        },
      });
      console.log('✅ Demo user created: demo@breathewise.in (Password: Demo@2026)');
    } else {
      console.log('ℹ️ Demo user already exists');
    }

    // 2. Seed User Preferences with Health Profile
    await UserPreferences.findOneAndUpdate(
      { userId: demoUser._id },
      {
        $set: {
          lifestyle: {
            commuteMode: 'metro-bus',
            outdoorActivity: 'jogging',
            cookingFuel: 'lpg',
            dailyRoutine: {
              wakeUpTime: '06:30',
              commuteStart: '08:30',
              commuteEnd: '18:00',
            },
          },
          healthSensitivity: 'asthmatic',
          budget: 'moderate',
          interests: ['health', 'exercise', 'home-air'],
          notificationEnabled: true,
        },
      },
      { upsert: true, new: true }
    );
    console.log('✅ Demo preferences seeded with Asthmatic profile');

    // 3. Seed Today's Daily Plan
    const todayStr = new Date().toISOString().split('T')[0];
    await DailyPlan.findOneAndUpdate(
      { userId: demoUser._id, date: todayStr },
      {
        $set: {
          dailySummary: 'Morning smog inversion active over Delhi NCR. PM2.5 levels elevated until noon breeze develops. Asthmatic precautions in effect.',
          riskLevel: 'high',
          location: {
            city: 'New Delhi',
            latitude: 28.6139,
            longitude: 77.2090,
          },
          sourceSnapshot: {
            source: 'CPCB',
            stationName: 'Anand Vihar, Delhi - CPCB',
            aqi: 284,
            category: 'Poor',
            pm25: 142,
            pm10: 260,
            weather: {
              temperature: 24,
              windSpeed: 8,
              humidity: 58,
            },
          },
          recommendations: [
            {
              category: 'exercise',
              title: 'Shift morning jog indoors',
              reason: 'Peak PM2.5 particulate suspension between 6 AM - 9 AM triggers bronchial reactivity.',
              action: 'Perform indoor core, yoga, or treadmill workouts in a closed room.',
              priority: 'high',
              estimatedImpact: '-65% PM2.5 inhaled dose',
              suggestedTime: '07:00 AM',
              completed: true,
            },
            {
              category: 'commute',
              title: 'Use Metro with sealed N95 respirator',
              reason: 'Roadside traffic exhaust contains elevated black carbon and toxic NO2.',
              action: 'Wear certified N95 mask during station-to-office walk; prefer underground Metro lines.',
              priority: 'high',
              estimatedImpact: '-80% particulate filtration',
              suggestedTime: '08:30 AM',
              completed: true,
            },
            {
              category: 'ventilation',
              title: 'Ventilate home between 1 PM and 3 PM',
              reason: 'Solar heating elevates boundary inversion layer, dispersing ground contaminants.',
              action: 'Cross-ventilate living quarters for 25 minutes during afternoon window.',
              priority: 'medium',
              estimatedImpact: 'Refreshes indoor CO2 without excessive dust',
              suggestedTime: '01:30 PM',
              completed: false,
            },
            {
              category: 'diet',
              title: 'Hydrate with jaggery and anti-inflammatory herbal tea',
              reason: 'Antioxidants reduce oxidative stress induced by fine particulate matter.',
              action: 'Consume warm ginger tea or tulsi decoction after evening commute.',
              priority: 'low',
              estimatedImpact: 'Supports respiratory tract mucus clearance',
              suggestedTime: '06:30 PM',
              completed: false,
            },
          ],
          limitations: [
            'Telemetry recorded from Anand Vihar ground monitoring sensor.',
            'Advisory calibrated for sensitive airway profile under CPCB National AQI guidelines.',
          ],
          generatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Seeded today's plan (${todayStr}) with 2/4 completed tasks for streak demo`);

    // 4. Seed Verified Community Reports for Delhi & Surroundings
    const reports = [
      {
        userId: demoUser._id,
        userName: 'Aarav Sharma',
        category: 'garbage-burning',
        title: 'Municipal waste smoldering near bypass road',
        description: 'Open burning of dry leaves and plastic near residential sector 14. Heavy acrid smoke blowing south.',
        location: {
          city: 'New Delhi',
          neighborhood: 'Rohini Sector 14',
          latitude: 28.7150,
          longitude: 77.1200,
        },
        severity: 'high',
        status: 'approved',
        upvotes: 14,
      },
      {
        userId: demoUser._id,
        userName: 'Delhi Air Watcher',
        category: 'dust',
        title: 'Uncovered metro construction debris',
        description: 'High wind generating heavy airborne particulate dust due to missing water mist cannons on the flyover corridor.',
        location: {
          city: 'New Delhi',
          neighborhood: 'Lajpat Nagar Ring Road',
          latitude: 28.5670,
          longitude: 77.2430,
        },
        severity: 'moderate',
        status: 'approved',
        upvotes: 9,
      },
      {
        userId: demoUser._id,
        userName: 'Priya Verma',
        category: 'industrial',
        title: 'Dense industrial emissions during evening shift',
        description: 'Noticeable sulfurous odor and dense black chimney emissions from boiler unit after sunset.',
        location: {
          city: 'New Delhi',
          neighborhood: 'Mayapuri Industrial Area',
          latitude: 28.6280,
          longitude: 77.1050,
        },
        severity: 'hazardous',
        status: 'approved',
        upvotes: 21,
      },
    ];

    for (const rep of reports) {
      await CommunityReport.findOneAndUpdate(
        { title: rep.title, 'location.city': rep.location.city },
        { $set: rep },
        { upsert: true }
      );
    }
    console.log('✅ Seeded 3 verified community reports for Delhi');

    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
