-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "hue" TEXT NOT NULL,
    "tagline" TEXT,
    "image" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Insert existing categories before adding the foreign key
INSERT INTO "Category" ("id", "label", "icon", "hue", "tagline", "image")
VALUES
    ('tshirts', 'Anime T-Shirts', 'Shirt', 'hue-red', 'Stylish. Bold. Anime.', '/images/categories/tshirts.png'),
    ('hotwheels', 'Hot Wheels', 'Car', 'hue-sky', 'Mini Cars. Mega Passion.', '/images/categories/hotwheels.png'),
    ('figures', 'Anime Figures', 'User', 'hue-violet', 'Collect. Display. Be Proud.', '/images/categories/figures.png'),
    ('rc', 'RC Cars & Bikes', 'Gamepad2', 'hue-orange-light', 'Remote Control. Real Thrill.', '/images/categories/rc.png');

-- AddForeignKey
ALTER TABLE "Product"
ADD CONSTRAINT "Product_category_fkey"
FOREIGN KEY ("category")
REFERENCES "Category"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;