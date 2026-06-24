import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Start seeding Toronto PF&R data...")

  // Clean the database
  await prisma.auditLog.deleteMany()
  await prisma.analyticsEvent.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.route.deleteMany()
  await prisma.terminal.deleteMany()
  await prisma.ferry.deleteMany()
  await prisma.program.deleteMany()
  await prisma.park.deleteMany()
  await prisma.event.deleteMany()
  await prisma.permitRequest.deleteMany()
  await prisma.page.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.user.deleteMany()
  await prisma.maintenanceRequest.deleteMany()

  console.log("Database cleared.")

  // Create Users with standard "password123"
  const passwordHash = await bcrypt.hash("password123", 10)
  
  const admin = await prisma.user.create({
    data: {
      name: "Toronto PF&R Admin",
      email: "admin@toronto.ca",
      passwordHash,
      role: "admin",
      language: "en",
    },
  })

  const staff = await prisma.user.create({
    data: {
      name: "Toronto Operations Staff",
      email: "staff@toronto.ca",
      passwordHash,
      role: "staff",
      language: "en",
    },
  })

  const citizen = await prisma.user.create({
    data: {
      name: "Toronto Resident",
      email: "citizen@toronto.ca",
      passwordHash,
      role: "citizen",
      language: "en",
    },
  })

  const director = await prisma.user.create({
    data: {
      name: "Toronto Director (Senior Management)",
      email: "director@toronto.ca",
      passwordHash,
      role: "admin",
      language: "en",
    },
  })

  console.log("Users created.")

  // Create Toronto Terminals
  const jackLaytonTerminal = await prisma.terminal.create({
    data: {
      name: "Jack Layton Ferry Terminal",
      lat: 43.6400,
      lng: -79.3753,
      address: "9 Queens Quay W, Toronto, ON M5J 2H3",
      accessibilityFeatures: JSON.stringify(["Wheelchair Accessible Ramp", "Restrooms", "Tactile Paving", "Audio Announcements"]),
    },
  })

  const centreIslandTerminal = await prisma.terminal.create({
    data: {
      name: "Centre Island Dock",
      lat: 43.6210,
      lng: -79.3720,
      address: "Centre Island, Toronto, ON M5J 2E9",
      accessibilityFeatures: JSON.stringify(["Wheelchair Accessible Ramp", "Accessible Restrooms"]),
    },
  })

  const hanlansTerminal = await prisma.terminal.create({
    data: {
      name: "Hanlan's Point Dock",
      lat: 43.6212,
      lng: -79.3905,
      address: "Hanlan's Point, Toronto, ON M5J 2E9",
      accessibilityFeatures: JSON.stringify(["Wheelchair Accessible Ramp", "Restrooms"]),
    },
  })

  const wardsTerminal = await prisma.terminal.create({
    data: {
      name: "Ward's Island Dock",
      lat: 43.6250,
      lng: -79.3585,
      address: "Ward's Island, Toronto, ON M5J 2E9",
      accessibilityFeatures: JSON.stringify(["Wheelchair Accessible Ramp", "Restrooms"]),
    },
  })

  console.log("Terminals created.")

  // Create Ferries (Ships)
  const samMcBride = await prisma.ferry.create({
    data: { name: "Sam McBride", capacity: 900, status: "active" },
  })

  const thomasRennie = await prisma.ferry.create({
    data: { name: "Thomas Rennie", capacity: 900, status: "active" },
  })

  const williamInglis = await prisma.ferry.create({
    data: { name: "William Inglis", capacity: 400, status: "active" },
  })

  const ongiara = await prisma.ferry.create({
    data: { name: "Ongiara (Car Ferry)", capacity: 250, status: "active" },
  })

  const windsor = await prisma.ferry.create({
    data: { name: "Windsor Ferry", capacity: 150, status: "active" },
  })

  console.log("Ferries created.")

  // Create Routes (Point-to-Point routes from Jack Layton)
  const routeCentre = await prisma.route.create({
    data: {
      name: "Jack Layton Terminal to Centre Island",
      originTerminalId: jackLaytonTerminal.id,
      destinationTerminalId: centreIslandTerminal.id,
      distanceKm: 2.1,
      estimatedDurationMin: 15,
    },
  })

  const routeHanlans = await prisma.route.create({
    data: {
      name: "Jack Layton Terminal to Hanlan's Point",
      originTerminalId: jackLaytonTerminal.id,
      destinationTerminalId: hanlansTerminal.id,
      distanceKm: 2.6,
      estimatedDurationMin: 15,
    },
  })

  const routeWards = await prisma.route.create({
    data: {
      name: "Jack Layton Terminal to Ward's Island",
      originTerminalId: jackLaytonTerminal.id,
      destinationTerminalId: wardsTerminal.id,
      distanceKm: 2.4,
      estimatedDurationMin: 15,
    },
  })

  console.log("Routes created.")

  // Create Schedules (For next 7 days, departing every hour between 8 AM and 6 PM)
  const ferries = [samMcBride, thomasRennie, williamInglis, ongiara, windsor]
  const routes = [routeCentre, routeHanlans, routeWards]
  
  const schedulesData = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + dayOffset)

    for (let hour = 8; hour <= 18; hour++) {
      const departureTime = new Date(currentDate)
      departureTime.setHours(hour, 0, 0, 0)

      // Pick route and ferry based on math offsets
      const route = routes[(dayOffset + hour) % routes.length]
      const ferry = ferries[(dayOffset * 2 + hour) % ferries.length]

      const arrivalTime = new Date(departureTime)
      arrivalTime.setMinutes(departureTime.getMinutes() + route.estimatedDurationMin)

      let status = "on-time"
      if (dayOffset === 0 && hour === 11) {
        status = "delayed"
      } else if (dayOffset === 0 && hour === 15) {
        status = "boarding"
      } else if (dayOffset === 1 && hour === 9) {
        status = "cancelled"
      }

      schedulesData.push({
        routeId: route.id,
        ferryId: ferry.id,
        departureTime,
        arrivalTime,
        status,
        capacityRemaining: ferry.capacity,
        recurrenceRule: "daily",
      })
    }
  }

  await prisma.schedule.createMany({
    data: schedulesData,
  })

  console.log("Schedules created.")

  // Create Safety Alerts
  const now = new Date()
  await prisma.alert.create({
    data: {
      title: "Strong Wind Warning - Lake Ontario",
      body: "High wind cautions issued by Environment Canada for Lake Ontario. Centre Island ferries may experience minor delays. Hanlan's Point car ferry is running on schedule.",
      severity: "warning",
      routeId: routeCentre.id,
      validFrom: now,
      validUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day
      createdById: admin.id,
    },
  })

  await prisma.alert.create({
    data: {
      title: "Ward's Island Dock Boarding Gate Maintenance",
      body: "Boarding Gate B at Ward's Island dock is undergoing maintenance. Please use Gate A for all departures. Expect minor boarding delays.",
      severity: "info",
      routeId: routeWards.id,
      validFrom: now,
      validUntil: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 2 days
      createdById: admin.id,
    },
  })

  await prisma.alert.create({
    data: {
      title: "Summer Concert Weekend Congestion",
      body: "Very high passenger volumes expected at Jack Layton Ferry Terminal due to the Island Concert. Long wait times up to 60 minutes are anticipated between 12:00 PM and 4:00 PM. Visitors are highly encouraged to purchase digital passes in advance.",
      severity: "critical",
      validFrom: now,
      validUntil: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 3 days
      createdById: admin.id,
    },
  })

  console.log("Alerts created.")

  // Create Parks (Toronto Parks)
  const torontoIslandPark = await prisma.park.create({
    data: {
      name: "Toronto Island Park",
      description: "A spectacular group of 15 islands located offshore from downtown Toronto, connected by bridges and pathways. Free of cars, featuring sandy beaches, nature trails, picnic spots, and the historic Centerville Amusement Park.",
      lat: 43.6210,
      lng: -79.3720,
      images: JSON.stringify(["/images/island_1.jpg", "/images/island_2.jpg"]),
      accessibilityFeatures: JSON.stringify(["Accessible ferry boarding", "Wheelchair accessible paved pathways", "All-terrain beach wheelchair rentals"]),
      hoursJson: JSON.stringify({ open: "08:00", close: "23:00", closedOn: "None" }),
    },
  })

  const highPark = await prisma.park.create({
    data: {
      name: "High Park",
      description: "Toronto's largest public park spanning 400 acres, featuring beautiful hiking trails, sporting facilities, Grenadier Pond, the High Park Zoo, and historic cherry blossom trees.",
      lat: 43.6465,
      lng: -79.4635,
      images: JSON.stringify(["/images/highpark_1.jpg", "/images/highpark_2.jpg"]),
      accessibilityFeatures: JSON.stringify(["Accessible parking lots", "Wheelchair-friendly pathways", "Accessible washrooms"]),
      hoursJson: JSON.stringify({ open: "06:00", close: "23:00", closedOn: "None" }),
    },
  })

  const trinityBellwoods = await prisma.park.create({
    data: {
      name: "Trinity Bellwoods Park",
      description: "A vibrant downtown park centered in Toronto's West End, popular for picnics, tennis courts, baseball diamonds, and neighborhood gatherings.",
      lat: 43.6475,
      lng: -79.4139,
      images: JSON.stringify(["/images/trinity_1.jpg"]),
      accessibilityFeatures: JSON.stringify(["Paved walkways", "Accessible playground area"]),
      hoursJson: JSON.stringify({ open: "06:00", close: "23:00", closedOn: "None" }),
    },
  })

  const tommyThompson = await prisma.park.create({
    data: {
      name: "Tommy Thompson Park",
      description: "Located on the Leslie Street Spit, this park is a unique man-made peninsula extending 5 km into Lake Ontario, serving as a wildlife reserve for over 300 nesting bird species.",
      lat: 43.6213,
      lng: -79.3338,
      images: JSON.stringify(["/images/tommy_1.jpg"]),
      accessibilityFeatures: JSON.stringify(["Paved multi-use trail"]),
      hoursJson: JSON.stringify({ open: "09:00", close: "18:00", closedOn: "Weekdays" }),
    },
  })

  console.log("Parks created.")

  // Create Programs
  await prisma.program.create({
    data: {
      name: "Island Beach Morning Yoga",
      description: "Kickstart your weekend with outdoor yoga sessions right by the sand on Centre Island beach. Open to all fitness levels.",
      category: "Health & Fitness",
      schedule: "Saturdays and Sundays, 08:00 AM - 09:15 AM",
      parkId: torontoIslandPark.id,
    },
  })

  await prisma.program.create({
    data: {
      name: "Leslie Spit Bird Watching Tour",
      description: "A guided educational tour introducing migratory waterfowl and rare raptors nesting at Tommy Thompson Park.",
      category: "Education & Nature",
      schedule: "Saturdays, 10:00 AM - 12:00 PM",
      parkId: tommyThompson.id,
    },
  })

  await prisma.program.create({
    data: {
      name: "High Park Sakura Cherry Blossom Walk",
      description: "Learn about the botanical history of Toronto's cherry blossom trees on a guided spring walking trail around Grenadier Pond.",
      category: "Environment",
      schedule: "Sundays, 11:00 AM - 01:00 PM",
      parkId: highPark.id,
    },
  })

  console.log("Programs created.")

  // Create Events
  await prisma.event.create({
    data: {
      title: "Toronto Island Music Festival",
      description: "A wonderful lakeside music festival featuring local Canadian acoustic bands, food trucks, and interactive art exhibits.",
      startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      location: "Olympic Island, Toronto Island Park",
      rsvpCount: 1450,
    },
  })

  await prisma.event.create({
    data: {
      title: "Shakespeare in High Park",
      description: "The annual outdoor theater performance presented by Canadian Stage under the stars at the High Park Amphitheatre.",
      startAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      location: "High Park Amphitheatre",
      rsvpCount: 820,
    },
  })

  await prisma.event.create({
    data: {
      title: "Toronto Island Lakeside Marathon",
      description: "A flat, scenic 10K running route weaving through Ward's Island and Hanlan's Point promoting active recreation.",
      startAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      location: "Hanlan's Point Gate",
      rsvpCount: 520,
    },
  })

  console.log("Events created.")

  // Create Announcements (CMS layer in English & French)
  await prisma.announcement.create({
    data: {
      title: "Online Ferry Booking System Live",
      body: "Passengers can now check live boat schedules, capacities, and purchase digital QR code tickets directly through our portal.",
      language: "en",
    },
  })

  await prisma.announcement.create({
    data: {
      title: "Système de réservation de traversier en ligne activé",
      body: "Les passagers peuvent désormais consulter les horaires des traversiers en direct et acheter leurs cartes d'embarquement numériques avec code QR.",
      language: "fr",
    },
  })

  // Create Pages (CMS layer)
  await prisma.page.create({
    data: {
      slug: "accessibility",
      title: "Accessibility & Facilities / Accessibilité et installations",
      body: "Toronto Parks, Forestry & Recreation (PF&R) is committed to providing fully accessible park services and ferry transportation. All major terminals, including Jack Layton Ferry Terminal and Centre Island Dock, feature low-height boarding gates, wheelchair ramps, accessible restrooms, and tactile guidance paths.\n\n***\n\nParcs, foresterie et loisirs de Toronto s'engage à fournir des services de parcs et de transport par traversier entièrement accessibles. Tous les terminaux principaux, y compris le terminal de traversiers Jack Layton et le quai de Centre Island, disposent de portes d'embarquement surbaissées, de rampes d'accès, de toilettes accessibles et de bandes de guidage tactiles.",
      language: "en",
    },
  })

  await prisma.page.create({
    data: {
      slug: "privacy-policy",
      title: "Privacy Policy / Politique de confidentialité",
      body: "We comply strictly with the Municipal Freedom of Information and Protection of Privacy Act (MFIPPA). Any personal information collected during boarding ticket bookings or facility permit applications is encrypted, secure, and used strictly for operational verification.\n\n***\n\nNous respectons strictement la Loi sur l'accès à l'information municipale et la protection de la vie privée (LAIMPVP). Toutes les informations personnelles recueillies lors de l'achat de billets ou de demandes de permis sont cryptées, sécurisées et utilisées uniquement à des fins de vérification.",
      language: "en",
    },
  })

  // Create Maintenance Requests
  await prisma.maintenanceRequest.create({
    data: {
      title: "Jack Layton Terminal Gate A Hinge Repair",
      description: "The main entry boarding gate hinge for Gate A is loose and squeaking. Requires grease and tightening.",
      facilityType: "terminal",
      facilityName: "Jack Layton Ferry Terminal",
      status: "pending",
      reportedBy: "citizen@toronto.ca",
    }
  })

  await prisma.maintenanceRequest.create({
    data: {
      title: "Sam McBride Ferry Deck Seat Polish",
      description: "Two plastic seats on the upper starboard deck have deep scratches. Need sanding and polishing.",
      facilityType: "ferry",
      facilityName: "Sam McBride",
      status: "pending",
      reportedBy: "staff@toronto.ca",
    }
  })

  await prisma.maintenanceRequest.create({
    data: {
      title: "Ward's Island Children's Slide Safety Hanger",
      description: "The support chains on the playground slide at Ward's Island Park are loose. Swing area needs audit.",
      facilityType: "park",
      facilityName: "Toronto Island Park",
      status: "accepted",
      reportedBy: "citizen@toronto.ca",
      acceptedById: staff.id,
      acceptedAt: new Date(),
    }
  })

  await prisma.maintenanceRequest.create({
    data: {
      title: "Hanlan's Point Dock Ramp Plank Fix",
      description: "Replace a decayed wooden deck plank on the floating pontoon ramp to prevent tripping.",
      facilityType: "terminal",
      facilityName: "Hanlan's Point Dock",
      status: "completed",
      reportedBy: "staff@toronto.ca",
      acceptedById: staff.id,
      acceptedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 10 * 60 * 1000),
    }
  })

  console.log("CMS content created.")
  console.log("Toronto seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
