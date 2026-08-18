# DB Migration Runner Skill

Load this skill for any task that changes the database schema: adding a model or field, changing a type, adding an index or constraint, or writing a data migration. Do not edit `prisma/schema.prisma` or run migrations from memory. Schema is the product's backbone — the scholarship database is the moat — so schema changes get their own commit and their own care.

Read `.agents/rules/architecture.md` and `.agents/rules/security.md` alongside this skill.

## The Migration Workflow

```bash
# 1. Edit prisma/schema.prisma (see conventions below).

# 2. Generate a migration and apply it locally.
npx prisma migrate dev --name <short_snake_case_name>

# 3. Read the generated SQL in prisma/migrations/<timestamp>_<name>/migration.sql.
#    Confirm it does what you intended and nothing destructive by surprise.

# 4. Regenerate the client if needed (migrate dev usually does this).
npx prisma generate

# 5. Commit schema.prisma AND the migration folder together, in their own commit.
```

In production, migrations are applied with `npx prisma migrate deploy` (not `migrate dev`). Never hand-edit a migration that has already been applied anywhere; write a new migration instead.

## The Bursa Data Model

These are the core entities. Keep them aligned with the PRD; do not add models the MVP does not need (there is no payment, order, or transaction model in Bursa).

```prisma
model User {
  id           String   @id @default(cuid())
  name         String?
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         Role     @default(STUDENT)

  // optional eligibility profile
  nationality  String?
  studyLevel   StudyLevel? @map("study_level")
  fieldOfStudy String?     @map("field_of_study")
  targetRegion String?     @map("target_region")
  onboardedAt  DateTime?   @map("onboarded_at")

  saved        SavedScholarship[]
  sessions     Session[]
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}

// Custom cookie-backed sessions per security.md — not an Auth.js/NextAuth
// adapter shape. Deleting the row is what makes logout server-side, per
// security.md's "logout invalidates the session on the server, not just
// the cookie" requirement.
model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

model Scholarship {
  id                    String       @id @default(cuid())
  title                 String
  slug                  String       @unique
  provider              String
  logoUrl               String?      @map("logo_url")
  officialUrl           String       @map("official_url")
  applicationUrl        String?      @map("application_url")

  fundingLevel          FundingLevel @map("funding_level")
  studyLevels           StudyLevel[] @map("study_levels")
  fieldsOfStudy         String[]     @map("fields_of_study")
  hostCountry           String       @map("host_country")
  region                String
  eligibleNationalities String[]     @map("eligible_nationalities")
  openToAllAfrican      Boolean      @default(false) @map("open_to_all_african")

  benefits              String
  eligibility           String
  requirements          String

  opensAt               DateTime?    @map("opens_at")
  deadlineAt            DateTime?    @map("deadline_at")
  status                ScholarshipStatus @default(DRAFT)
  source                String
  verifiedAt            DateTime?    @map("verified_at")

  saved                 SavedScholarship[]
  createdAt             DateTime     @default(now()) @map("created_at")
  updatedAt             DateTime     @updatedAt @map("updated_at")

  @@index([status, deadlineAt])
  @@index([region])
  @@index([hostCountry])
  @@map("scholarships")
}

model SavedScholarship {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  scholarshipId String   @map("scholarship_id")
  createdAt     DateTime @default(now()) @map("created_at")

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  scholarship   Scholarship @relation(fields: [scholarshipId], references: [id], onDelete: Cascade)

  @@unique([userId, scholarshipId])   // makes save idempotent — a repeat is a clean no-op
  @@map("saved_scholarships")
}

enum Role {
  STUDENT
  ADMIN
}

enum StudyLevel {
  UNDERGRADUATE
  MASTERS
  PHD
  RESEARCH
}

enum FundingLevel {
  FULL
  PARTIAL
  TUITION_ONLY
  STIPEND
}

enum ScholarshipStatus {
  DRAFT
  PUBLISHED
  CLOSED
  ARCHIVED
}
```

**Comparison** is a 2–4 item selection, not a persisted row in the MVP — keep it in URL search params or lightweight client state (see `architecture.md`). Do not add a `Comparison` table unless the developer decides comparisons must persist across devices.

## Naming Conventions

- Models are `PascalCase` singular: `User`, `Scholarship`, `SavedScholarship`.
- Table names are `snake_case` plural via `@@map("...")`.
- Columns are `camelCase` in Prisma, mapped to `snake_case` with `@map("...")`.
- Enums are `PascalCase`; enum values are `SCREAMING_SNAKE_CASE`.

## Constraints and Indexes That Matter

- **`Scholarship.slug` is unique.** Slugs are the public, indexable, shareable URL — they must be unique and stable. Generate them in `lib/slug.ts`; do not change a published slug without a redirect plan.
- **`SavedScholarship (userId, scholarshipId)` is unique.** This is what makes saving idempotent: a duplicate insert throws Prisma `P2002`, which the save endpoint catches and treats as success.
- **Index the fields the feed filters and sorts on** — `status` + `deadlineAt`, `region`, `hostCountry`. The feed is the highest-traffic path; unindexed filter scans will hurt on real data volumes.
- Use `onDelete: Cascade` on `SavedScholarship` so removing a user or scholarship cleans up its saved rows.

## Migration Safety

- **Additive first.** Add a nullable column or a new table before you require it. Backfill data in a separate step. Only then tighten the constraint (make it non-null, add the unique index). A single migration that adds a required column to a populated table will fail.
- **Never edit an applied migration.** Write a new one.
- **Review the generated SQL every time.** `migrate dev` can generate a destructive step (a drop, a type change that loses data). Read it before committing.
- **Enums change carefully.** Adding an enum value is safe; removing or renaming one needs a data migration for existing rows.
- Raw SQL is only allowed inside migration files.

## Seeding Curated Data

MVP scholarships are curated manually from trusted sources. Keep a `prisma/seed.ts` that inserts a small set of verified, well-formed scholarships for local development — real providers, valid `https` official URLs, realistic deadlines and eligibility. Seed data is how the feed, filters, eligibility, and empty states get exercised before real curation exists.

## Common Mistakes

- Adding a `Payment`, `Order`, or `Transaction` model. Bursa handles no money — these do not belong.
- Storing amounts, fees, or currency anywhere. There are none.
- Adding a required column to a populated table in one step (backfill first).
- Forgetting the `(userId, scholarshipId)` unique constraint, which breaks idempotent saving.
- Storing an unvalidated `officialUrl`. Validate it's an `https` absolute URL at curation time (see `security.md`).
- Editing a migration that's already been applied.