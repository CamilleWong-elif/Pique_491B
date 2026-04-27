require("dotenv").config();
const { db } = require("../src/config/firebase");

async function recalculatePointsForAllUsers() {
  console.log("Recalculating points with current rules...");
  const usersSnap = await db.collection("users").get();
  let updated = 0;

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const [reviewsSnap, bookingsSnap] = await Promise.all([
      db.collection("reviews").where("author", "==", uid).get(),
      db.collection("bookings").where("userId", "==", uid).get(),
    ]);

    const rateReviewCount = reviewsSnap.size;
    const reviewPhotoCount = reviewsSnap.docs.reduce((sum, doc) => {
      const images = doc.data().images;
      return sum + (Array.isArray(images) ? images.length : 0);
    }, 0);
    const bookingsCount = bookingsSnap.size;

    const points =
      rateReviewCount * 5 +
      reviewPhotoCount +
      bookingsCount * 2;

    await db.collection("users").doc(uid).update({ points });
    updated += 1;

    console.log(
      `[${updated}/${usersSnap.size}] ${uid}: points=${points} (reviews=${rateReviewCount}, photos=${reviewPhotoCount}, bookings=${bookingsCount})`
    );
  }

  console.log(`Done. Updated ${updated} users.`);
}

recalculatePointsForAllUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to recalculate points:", err);
    process.exit(1);
  });
