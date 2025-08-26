const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// Function #1: Deletes old posts automatically
exports.deleteOldPosts = functions.pubsub.schedule("every 4 hours").onRun(async (context) => {
  console.log("Running scheduled post deletion...");
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oldPostsQuery = db.collection("posts").where("createdAt", "<", twentyFourHoursAgo);
  const snapshot = await oldPostsQuery.get();

  if (snapshot.empty) {
    console.log("No old posts to delete.");
    return null;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    console.log(`Scheduling deletion for post: ${doc.id}`);
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Deleted ${snapshot.size} old posts.`);
  return null;
});


// Function #2: Cleans up user data when an account is deleted
exports.cleanupUserData = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;
  console.log(`Cleaning up data for deleted user: ${uid}`);
  const batch = db.batch();

  // Delete user's profile
  const userProfileRef = db.collection("users").doc(uid);
  batch.delete(userProfileRef);

  // Delete user's posts
  const postsQuery = db.collection("posts").where("authorId", "==", uid);
  const postsSnapshot = await postsQuery.get();
  postsSnapshot.forEach((doc) => batch.delete(doc.ref));

  // Delete user's chats
  const chatsQuery = db.collection("chats").where("participants", "array-contains", uid);
  const chatsSnapshot = await chatsQuery.get();
  chatsSnapshot.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
  console.log(`Successfully cleaned up Firestore data for user: ${uid}`);

  // Delete user's status from Realtime Database
  return admin.database().ref(`/status/${uid}`).remove();
});