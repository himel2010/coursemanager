-- CreateTable "supervisors"
CREATE TABLE IF NOT EXISTS "public"."supervisors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facultyId" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentThesis" INTEGER NOT NULL DEFAULT 0,
    "currentInternship" INTEGER NOT NULL DEFAULT 0,
    "maxThesisSlots" INTEGER NOT NULL DEFAULT 5,
    "maxInternshipSlots" INTEGER NOT NULL DEFAULT 3,
    "bio" TEXT,
    "phoneNumber" TEXT,
    "office" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable "thesis_slots"
CREATE TABLE IF NOT EXISTS "public"."thesis_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supervisorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableTo" TIMESTAMP(3) NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thesis_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable "internship_slots"
CREATE TABLE IF NOT EXISTS "public"."internship_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supervisorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "company" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stipend" TEXT,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableTo" TIMESTAMP(3) NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable "student_applications"
CREATE TABLE IF NOT EXISTS "public"."student_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "supervisorId" UUID NOT NULL,
    "thesisSlotId" UUID,
    "internshipSlotId" UUID,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,
    "resume" TEXT,

    CONSTRAINT "student_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable "thesis_groups"
CREATE TABLE IF NOT EXISTS "public"."thesis_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creatorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thesisSlotId" UUID,
    "supervisorId" UUID,
    "maxMembers" INTEGER NOT NULL DEFAULT 5,
    "topic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thesis_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable "group_members"
CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "groupId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable "group_join_requests"
CREATE TABLE IF NOT EXISTS "public"."group_join_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "groupId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "group_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "supervisors_email_key" ON "public"."supervisors"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "thesis_slots_supervisorId_idx" ON "public"."thesis_slots"("supervisorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "thesis_slots_isOpen_idx" ON "public"."thesis_slots"("isOpen");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "internship_slots_supervisorId_idx" ON "public"."internship_slots"("supervisorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "internship_slots_isOpen_idx" ON "public"."internship_slots"("isOpen");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "student_applications_studentId_idx" ON "public"."student_applications"("studentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "student_applications_supervisorId_idx" ON "public"."student_applications"("supervisorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "student_applications_status_idx" ON "public"."student_applications"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "thesis_groups_creatorId_idx" ON "public"."thesis_groups"("creatorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "thesis_groups_thesisSlotId_idx" ON "public"."thesis_groups"("thesisSlotId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "thesis_groups_supervisorId_idx" ON "public"."thesis_groups"("supervisorId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "group_members_groupId_userId_key" ON "public"."group_members"("groupId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "group_members_groupId_idx" ON "public"."group_members"("groupId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "group_members_userId_idx" ON "public"."group_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "group_join_requests_groupId_userId_key" ON "public"."group_join_requests"("groupId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "group_join_requests_groupId_idx" ON "public"."group_join_requests"("groupId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "group_join_requests_userId_idx" ON "public"."group_join_requests"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "group_join_requests_status_idx" ON "public"."group_join_requests"("status");

-- AddForeignKey
ALTER TABLE "public"."thesis_slots" ADD CONSTRAINT "thesis_slots_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."supervisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."internship_slots" ADD CONSTRAINT "internship_slots_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."supervisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_applications" ADD CONSTRAINT "student_applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_applications" ADD CONSTRAINT "student_applications_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."supervisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_applications" ADD CONSTRAINT "student_applications_thesisSlotId_fkey" FOREIGN KEY ("thesisSlotId") REFERENCES "public"."thesis_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_applications" ADD CONSTRAINT "student_applications_internshipSlotId_fkey" FOREIGN KEY ("internshipSlotId") REFERENCES "public"."internship_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."thesis_groups" ADD CONSTRAINT "thesis_groups_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."thesis_groups" ADD CONSTRAINT "thesis_groups_thesisSlotId_fkey" FOREIGN KEY ("thesisSlotId") REFERENCES "public"."thesis_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."thesis_groups" ADD CONSTRAINT "thesis_groups_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."supervisors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."thesis_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_join_requests" ADD CONSTRAINT "group_join_requests_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."thesis_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_join_requests" ADD CONSTRAINT "group_join_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
