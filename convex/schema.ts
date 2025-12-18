import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    userId: v.string(),
    organizationId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastEditedBy: v.string(),
  })
    .index("userId", ["userId"])
    .index("organizationId", ["organizationId"]),

  documentShares: defineTable({
    documentId: v.id("documents"),
    sharedWithUserId: v.string(),
    permissions: v.string(),
    sharedAt: v.number(),
  })
    .index("documentId", ["documentId"])
    .index("sharedWithUserId", ["sharedWithUserId"]),

  cursorPositions: defineTable({
    documentId: v.id("documents"),
    userId: v.string(),
    userName: v.string(),
    position: v.number(),
    userColor: v.string(),
    timestamp: v.number(),
  })
    .index("documentId", ["documentId"]),
});
