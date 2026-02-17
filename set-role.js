const admin = require("firebase-admin");
admin.initializeApp({ projectId: "newsvendor-kostas" });

async function setRole() {
  const user = await admin.auth().getUserByEmail("kostas@test.com");
  await admin.auth().setCustomUserClaims(user.uid, { role: "instructor" });
  console.log("Done! Custom claims set for", user.uid);
  process.exit(0);
}
setRole().catch(console.error);