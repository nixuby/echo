-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" DATETIME,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT NOT NULL DEFAULT '',
    "provider" TEXT NOT NULL DEFAULT 'local',
    "providerId" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "notificationSettings" TEXT NOT NULL DEFAULT '{}',
    "language" TEXT NOT NULL DEFAULT 'en'
);
INSERT INTO "new_User" ("bio", "createdAt", "email", "emailVerifiedAt", "id", "isEmailVerified", "isVerified", "name", "notificationSettings", "password", "provider", "providerId", "updatedAt", "username") SELECT "bio", "createdAt", "email", "emailVerifiedAt", "id", "isEmailVerified", "isVerified", "name", "notificationSettings", "password", "provider", "providerId", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "User"("provider", "providerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
