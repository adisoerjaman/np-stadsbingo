# StadsBingo

Een **bingo-applicatie** voor school waarbij leerlingen opdrachten uitvoeren in de stad en docenten deze beoordelen.

> **Examen Project** - Bit Academy  
> Ontwikkeld door: Davey & Jada  
> Periode: December 2025

---

## Table of Contents

- [StadsBingo](#stadsbingo)
  - [Table of Contents](#table-of-contents)
  - [Project Omschrijving](#project-omschrijving)
  - [Features](#features)
    - [Voor Leerlingen (Students)](#voor-leerlingen-students)
    - [Voor Docenten (Teachers)](#voor-docenten-teachers)
  - [Tech Stack](#tech-stack)
  - [Requirements](#requirements)
  - [Quick Start](#quick-start)
  - [Setup Details](#setup-details)
    - [Clone & Navigate](#clone--navigate)
    - [Environment Variables](#environment-variables)
    - [Start PostgreSQL](#start-postgresql)
    - [Install Dependencies](#install-dependencies)
    - [Database Setup](#database-setup)
    - [Start Development](#start-development)
  - [Database](#database)
  - [Prisma Commands](#prisma-commands)
  - [Development Workflow](#development-workflow)
    - [Voor nieuwe features:](#voor-nieuwe-features)
    - [Code Quality:](#code-quality)
  - [Examen Informatie](#examen-informatie)
  - [Optional Tips](#optional-tips)
  - [Team](#team)
  - [License](#license)

---

## Project Omschrijving

**StadsBingo** is een webapplicatie waarbij docenten **teams** aanmaken, leerlingen via **teamcodes** laten inloggen en opdrachten in een vaste volgorde laten uitvoeren. Docenten beoordelen de opdrachten, geven feedback en monitoren de voortgang van elk team.

**Kernworkflow:**
1. Docent maakt een team aan, koppelt leerlingen en genereert een teamcode.
2. Leerlingen loggen in met de teamcode en zien de opdrachten die voor hun team beschikbaar zijn.
3. Elke opdracht kent één van de statussen: `Locked`, `Available`, `Pending`, `Feedback`, `Approved`.
4. Leerlingen leveren fotobestanden in; docenten beoordelen en geven feedback.
5. Bij `Approved` wordt de volgende opdracht vrijgegeven; bij `Feedback` krijgt de leerling een notificatie om opnieuw in te leveren.
6. Docenten hebben filters op team, leerling en status én zien een visuele voortgang per team.

---

## Features

### Voor Leerlingen (Students)
- Login met teamcode en beveiligde toegang per team
- Opdrachtenlijst met statussen (`Locked`, `Available`, `Pending`, `Feedback`, `Approved`)
- Dien opdrachten in en verwerk feedback
- Visuele voortgang per opdracht en team
- Notificatie bij nieuwe feedback/aanpassingen

### Voor Docenten (Teachers/Admin)
- Teams beheren (aanmaken, verwijderen, leden koppelen) + teamcodes genereren
- Opdrachten beheren (aanmaken, bijlagen)
- Overzicht per team/leerling met filter op status, leerling, opdracht
- Goedkeuren of `Feedback` geven; bij feedback verplicht tekstveld
- Visuele voortgangsweergave per team

---

## Tech Stack

**Frontend & Backend:**
- [Next.js 15](https://nextjs.org/) - React framework met API routes
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI componenten

**Database & ORM:**
- [PostgreSQL](https://www.postgresql.org/) - Relational database (Docker)
- [Prisma](https://www.prisma.io/) - Type-safe ORM

**Development:**
- [Docker](https://www.docker.com/) - Database containerization
- [Biome](https://biomejs.dev/) - Linting & formatting

---

## Requirements

- [Node.js](https://nodejs.org/) (v18 of hoger)
- [Docker](https://www.docker.com/get-started)  
- [Docker Compose](https://docs.docker.com/compose/install/)  

---

## Quick Start

```bash
# 1. Clone de repository
git clone git@github.com:daveymunters87/StadsBingo.git
cd StadsBingo/project

# 2. Start de database (Docker)
docker-compose up -d

# 3. Install dependencies
npm install

# 4. Maak .env (kopieer .env.example) en vul beide variabelen.
DATABASE_URL="postgresql://myuser:mypassword@localhost:5433/mydb?schema=public"
# Geheim voor sessiecookies (min. 32 tekens). Genereer met: openssl rand -base64 32
SESSION_SECRET="een-willekeurige-string-van-minimaal-32-tekens"

# 5. Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser!

---

## Setup Details

### Clone & Navigate
```bash
git clone git@github.com:daveymunters87/StadsBingo.git
cd StadsBingo/project
```

### Environment Variables
Maak een `.env` bestand in de `project/` folder (zie `.env.example`):

```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5433/mydb?schema=public"
# Geheim voor het verzegelen van sessiecookies (iron-session), min. 32 tekens.
# Genereer een veilige waarde met: openssl rand -base64 32
SESSION_SECRET="een-willekeurige-string-van-minimaal-32-tekens"
```

> **Let op:** zonder `SESSION_SECRET` start de app bewust niet (fail-fast), omdat
> sessies anders niet veilig ondertekend kunnen worden.

> **Note:** Voor lokale development gebruik je `localhost`. `db` is de Docker service naam in `docker-compose.yml`.

### Start PostgreSQL
```bash
docker-compose up -d
```

Database draait nu op de achtergrond. Data wordt opgeslagen in Docker volume `pgdata`.

### Install Dependencies
```bash
npm install
```

### Database Setup
```bash
# Genereer Prisma client
npm run db:generate

# Run migrations (maakt de tabellen aan)
npm run db:migrate

# Seed database met test data (admin, team, opdrachten)
npm run db:seed
```

**Test credentials na seeding:**
- **Admin login:** admin@example.com / admin123
- **Team code:** TEST123
- **Test team:** "Test Team" met 5 spelers en 5 opdrachten

**Seeded data includes:**
- Admin user voor het beheren van teams en opdrachten
- Test team met teamcode "TEST123"
- 5 teamspelers (inclusief captain)
- 5 opdrachten in Groningen (Grote Markt, Vismarkt, Akerk, RUG, Forum)
- Team-opdracht koppelingen

### Start Development
```bash
npm run dev
```

App draait nu op: http://localhost:3000

---

## Database

**PostgreSQL draait in Docker** voor consistente setup tussen developers.

**Belangrijke commando's:**
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Stop database en verwijder data (fresh start)
docker-compose down -v

# Bekijk database logs
docker-compose logs -f db
```

**Default credentials** (zie `.env`):
- User: `myuser`
- Password: `mypassword`
- Database: `mydb`
- Port: `5432`

---

## Prisma Commands

```bash
# Genereer Prisma Client (na schema wijzigingen)
npm run db:generate

# Maak nieuwe migration
npm run db:migrate

# Push schema changes zonder migration (development only)
npm run db:push

# Seed database met test data
npm run db:seed

# Reset database (WAARSCHUWING: verwijdert alle data!)
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio
```

**Prisma Studio** opent op http://localhost:5555 en laat je database data bekijken/bewerken.

---

## Development Workflow

### Voor nieuwe features:
1. **Maak een nieuwe branch**
   ```bash
   git checkout -b feature/naam-van-feature
   ```

2. **Bouw de feature**
   - Wijzig Prisma schema indien nodig → `npm run db:migrate`
   - Schrijf code
   - Test lokaal met `npm test`

3. **Commit je werk**
   ```bash
   git add .
   git commit -m "feat: beschrijving van feature"
   ```

4. **Push en maak Pull Request**
   ```bash
   git push origin feature/naam-van-feature
   ```

### Code Quality:
```bash
# Check code quality
npm run lint

# Format code
npm run format

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Examen Informatie

Dit project is onderdeel van het **portfolio examen**.

**Examen Eisen die dit project voldoet:**

- **Opdracht 1:** User stories, planning, voortgangsbewaking  
- **Opdracht 2:** UML diagrammen (ERD + Sequence)  
- **Opdracht 3:** Werkende applicatie met:
   - Frontend + Backend + Database
   - 10+ bestanden met code
   - Git (10+ commits, 2+ branches, pull requests)
   - Non-CRUD functionaliteit (approve/reject workflow)

- **Opdracht 4:** Geautomatiseerde tests  
- **Opdracht 5:** Verbetervoorstellen  

**Documentatie:** Zie `/examen` folder voor alle bewijsmateriaal.

---

## Optional Tips

```bash
# Stop alle containers
docker-compose down

# Format hele repository
npm run format

# Bekijk Docker logs
docker-compose logs -f

# Rebuild Docker containers (bij problemen)
docker-compose down
docker-compose up -d --build

# Reset database en seed opnieuw
npm run db:reset
npm run db:seed

# Open database GUI
npm run db:studio
```

---

## Team

- **Davey Munters** - Developer
- **Jada** - Developer

---

## License

Copyright (c) 2026 Davey Munters

All rights reserved.

Dit project is gemaakt als educatief project voor Bit Academy.
Het is niet toegestaan om dit project zonder toestemming te kopiëren, verspreiden of commercieel te gebruiken.
# np-stadsbingo
