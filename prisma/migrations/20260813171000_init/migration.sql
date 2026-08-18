-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "StudyLevel" AS ENUM ('UNDERGRADUATE', 'MASTERS', 'PHD', 'RESEARCH');

-- CreateEnum
CREATE TYPE "FundingLevel" AS ENUM ('FULL', 'PARTIAL', 'TUITION_ONLY', 'STIPEND');

-- CreateEnum
CREATE TYPE "ScholarshipStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "nationality" TEXT,
    "study_level" "StudyLevel",
    "field_of_study" TEXT,
    "target_region" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "logo_url" TEXT,
    "official_url" TEXT NOT NULL,
    "application_url" TEXT,
    "funding_level" "FundingLevel" NOT NULL,
    "study_levels" "StudyLevel"[],
    "fields_of_study" TEXT[],
    "host_country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "eligible_nationalities" TEXT[],
    "open_to_all_african" BOOLEAN NOT NULL DEFAULT false,
    "benefits" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "opens_at" TIMESTAMP(3),
    "deadline_at" TIMESTAMP(3),
    "status" "ScholarshipStatus" NOT NULL DEFAULT 'DRAFT',
    "source" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_scholarships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scholarship_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "scholarships_slug_key" ON "scholarships"("slug");

-- CreateIndex
CREATE INDEX "scholarships_status_deadline_at_idx" ON "scholarships"("status", "deadline_at");

-- CreateIndex
CREATE INDEX "scholarships_region_idx" ON "scholarships"("region");

-- CreateIndex
CREATE INDEX "scholarships_host_country_idx" ON "scholarships"("host_country");

-- CreateIndex
CREATE UNIQUE INDEX "saved_scholarships_user_id_scholarship_id_key" ON "saved_scholarships"("user_id", "scholarship_id");

-- AddForeignKey
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
