-- CreateTable
CREATE TABLE "Accessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "regulation" "RegulationType" NOT NULL,

    CONSTRAINT "Accessory_pkey" PRIMARY KEY ("id")
);
