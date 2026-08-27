import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  // --- clean database
  await prisma.submission.deleteMany();
  await prisma.teamAssignment.deleteMany();
  await prisma.teamPlayer.deleteMany();
  await prisma.team.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.user.deleteMany();

  // --- create the admin (wachtwoord gehasht met bcrypt)
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN" as Role,
      isSuperAdmin: true,
    },
  });

  // --- create the user (wachtwoord gehasht met bcrypt)
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Regular User",
      password: await bcrypt.hash("user123", 12),
      role: "USER" as Role,
    },
  });

  // --- Create the teams
  const team = await prisma.team.create({
    data: {
      name: "Test Team",
      code: "TEST123",
      createdById: user.id,
    },
  });

  // --- Set teamcaptain
  const captain = await prisma.teamPlayer.create({
    data: {
      name: "Captain One",
      studentNumber: "S001",
      teamId: team.id,
    },
  });

  // Assign teamcaptain to team
  await prisma.team.update({
    where: { id: team.id },
    data: { captainId: captain.id },
  });

  // --- Create other teamplayers
  const playersData = [
    { name: "Speler Twee", studentNumber: "S002" },
    { name: "Speler Drie", studentNumber: "S003" },
    { name: "Speler Vier", studentNumber: "S004" },
    { name: "Speler Vijf", studentNumber: "S005" },
  ];

  for (const p of playersData) {
    await prisma.teamPlayer.create({
      data: { ...p, teamId: team.id },
    });
  }

  // --- Creat the assignments
  const assignments = await prisma.assignment.createMany({
    data: [
      {
        title: "Maak een foto van het standbeeld",
        description:
          "Voor jullie eerste opdracht verzamelen jullie op de Grote Markt. Maak een foto van minstens drie teamleden die voor het stadhuis poseren als levende standbeelden.",
        location: " Grote markt, Stadshuis",
        latitude: 53.2194,
        longitude: 6.5665,
        exampleImage: "/example-image/image1.png",
        order: 1,
      },
      {
        title: "Lekker vissie?",
        description:
          "Zoek een mooie plek op de Vismarkt en beeld met je team een ‘bevroren moment’ uit van iets dat met vissen of de markt te maken heeft. Maak een foto van jullie scene alsof het eens schilderij is",
        location: "Vismarkt",
        latitude: 53.2186,
        longitude: 6.5638,
        exampleImage: "/example-image/image2.png",
        order: 2,
      },
      {
        title: "Rondje Akerk",
        description:
          "Loop een rondje om de Akerk en zoek: Een leuk of grappig detail Een symbool of leuke patronen in de stenen Iets moderns aan de kerk",
        location: "Akerk",
        latitude: 53.2179,
        longitude: 6.563,
        exampleImage: "/example-image/image3.png",
        order: 3,
      },
      {
        title: "Poseren voor de uni",
        description:
          "Maak een foto van minstens drie teamleden die op het Broerplein poseren als studenten uit verschillende tijden (bijvoorbeeld: een student uit 1614, een uit de jaren ’70 en een van nu).",
        location: "Rijksuniversiteit Groningen",
        latitude: 53.2192,
        longitude: 6.5616,
        exampleImage: "/example-image/image4.png",
        order: 4,
      },
      {
        title: "The big finish",
        description:
          "Voor jullie laatste opdracht, maak een leuke groepsfoto op het dakterras van het Forum en meld je af bij een docent.",
        location: "Forum",
        latitude: 53.2199,
        longitude: 6.5685,
        exampleImage: "/example-image/image5.png",
        order: 5,
      },
    ],
  });

  // --- Link the assignments to dummy team
  const allAssignments = await prisma.assignment.findMany();
  for (const a of allAssignments) {
    await prisma.teamAssignment.create({
      data: {
        teamId: team.id,
        assignmentId: a.id,
        order: a.order,
      },
    });
  }

  console.log(
    "Seed complete: Admin, User, Team, Players, Assignments & TeamAssignments created",
  );
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
