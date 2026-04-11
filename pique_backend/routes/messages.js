const express = require("express");
const { db } = require("../src/config/firebase");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/messages/conversations — Get all conversations for current user
// Replaces mockConversations in MessagingScreen.tsx
// ---------------------------------------------------------------------------
router.get("/conversations", authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection("chats")
      .where("participants", "array-contains", req.user.uid)
      .orderBy("lastMessageAt", "desc")
      .get();

    const conversations = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Find the other participant
      const otherUid = data.participants.find((p) => p !== req.user.uid);

      let otherName = "Unknown";
      let otherAvatar = null;

      if (otherUid) {
        const userDoc = await db.collection("users").doc(otherUid).get();
        if (userDoc.exists) {
          otherName = userDoc.data().displayName || "Unknown";
          otherAvatar = userDoc.data().avatar || null;
        }
      }

      // Count unread messages
      const unreadSnap = await db
        .collection("chats")
        .doc(doc.id)
        .collection("messages")
        .where("senderId", "!=", req.user.uid)
        .where("read", "==", false)
        .get();

      conversations.push({
        id: doc.id,
        name: otherName,
        avatar: otherAvatar,
        lastMessage: data.lastMessage || "",
        lastMessageAt: data.lastMessageAt || "",
        unread: unreadSnap.size,
      });
    }

    return res.json(conversations);
  } catch (err) {
    console.error("GET /api/messages/conversations error:", err);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/messages/:conversationId — Get messages in a conversation
// Replaces mockMessages in MessagingScreen.tsx
// ---------------------------------------------------------------------------
router.get("/:conversationId", authenticate, async (req, res) => {
  try {
    const convoDoc = await db
      .collection("chats")
      .doc(req.params.conversationId)
      .get();

    if (!convoDoc.exists) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify user is a participant
    const participants = convoDoc.data().participants || [];
    if (!participants.includes(req.user.uid)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const snapshot = await db
      .collection("chats")
      .doc(req.params.conversationId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .limit(100)
      .get();

    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      const msg = {
        id: doc.id,
        text: data.text || '',
        fromMe: data.senderId === req.user.uid,
        timestamp: data.createdAt,
        senderId: data.senderId,
      };
      if (data.imageUrl) msg.imageUrl = data.imageUrl;
      if (data.fileUrl) msg.fileUrl = data.fileUrl;
      if (data.fileName) msg.fileName = data.fileName;
      if (data.replyTo) msg.replyTo = data.replyTo;
      return msg;
    });

    return res.json(messages);
  } catch (err) {
    console.error("GET /api/messages/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/messages/:conversationId — Send a message
// Replaces local-only sendMessage in MessagingScreen.tsx
// ---------------------------------------------------------------------------
router.post("/:conversationId", authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const convoRef = db
      .collection("chats")
      .doc(req.params.conversationId);

    const convoDoc = await convoRef.get();
    if (!convoDoc.exists) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const participants = convoDoc.data().participants || [];
    if (!participants.includes(req.user.uid)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { imageUrl, fileUrl, fileName, replyTo } = req.body;

    const messageData = {
      text: text.trim(),
      senderId: req.user.uid,
      read: false,
      createdAt: new Date().toISOString(),
    };
    if (imageUrl) messageData.imageUrl = imageUrl;
    if (fileUrl) messageData.fileUrl = fileUrl;
    if (fileName) messageData.fileName = fileName;
    if (replyTo) messageData.replyTo = replyTo;

    const msgRef = await convoRef.collection("messages").add(messageData);

    // Update conversation's last message
    await convoRef.update({
      lastMessage: text.trim(),
      lastMessageAt: new Date().toISOString(),
    });

    return res.status(201).json({
      id: msgRef.id,
      ...messageData,
      fromMe: true,
    });
  } catch (err) {
    console.error("POST /api/messages/:id error:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/messages/conversations/new — Start a new conversation
// ---------------------------------------------------------------------------
router.post("/conversations/new", authenticate, async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: "recipientId is required" });
    }

    // Check if conversation already exists between these two users
    const existing = await db
      .collection("chats")
      .where("participants", "array-contains", req.user.uid)
      .get();

    for (const doc of existing.docs) {
      if (doc.data().participants.includes(recipientId)) {
        return res.json({ id: doc.id, ...doc.data(), existing: true });
      }
    }

    const convoData = {
      participants: [req.user.uid, recipientId],
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("chats").add(convoData);

    return res.status(201).json({ id: docRef.id, ...convoData });
  } catch (err) {
    console.error("POST /api/messages/conversations/new error:", err);
    return res.status(500).json({ error: "Failed to create conversation" });
  }
});

module.exports = router;
