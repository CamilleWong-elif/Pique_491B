const { admin } = require("../config/firebase");

/**
 * Verifies the Firebase ID token sent from the React Native client.
 *
 * Usage on the client side:
 *   const token = await auth.currentUser.getIdToken();
 *   fetch(url, { headers: { Authorization: `Bearer ${token}` } })
 *
 * After verification, req.user is set to the decoded token which includes:
 *   - uid, email, name, picture, etc.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authenticate };
