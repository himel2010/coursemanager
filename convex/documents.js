import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Documents table
export const createDocument = mutation({
  args: {
    title: v.string(),
    userId: v.string(),
    content: v.string(),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      userId: args.userId,
      content: args.content,
      organizationId: args.organizationId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastEditedBy: args.userId,
    });
    return documentId;
  },
});

export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    title: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");

    await ctx.db.patch(args.documentId, {
      content: args.content,
      title: args.title || doc.title,
      updatedAt: Date.now(),
      lastEditedBy: args.userId,
    });
  },
});

export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    if (doc.userId !== args.userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.documentId);
  },
});

export const getDocument = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    return doc;
  },
});

export const listDocuments = query({
  args: {
    userId: v.string(),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let documents;
    if (args.organizationId) {
      documents = await ctx.db
        .query("documents")
        .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
        .collect();
    } else {
      documents = await ctx.db
        .query("documents")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
    }
    return documents.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const shareDocument = mutation({
  args: {
    documentId: v.id("documents"),
    sharedWithUserId: v.string(),
    permissions: v.string(), // "view" or "edit"
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    if (doc.userId !== args.userId) throw new Error("Unauthorized");

    const shareId = await ctx.db.insert("documentShares", {
      documentId: args.documentId,
      sharedWithUserId: args.sharedWithUserId,
      permissions: args.permissions,
      sharedAt: Date.now(),
    });
    return shareId;
  },
});

export const getSharedDocuments = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const shares = await ctx.db
      .query("documentShares")
      .filter((q) => q.eq(q.field("sharedWithUserId"), args.userId))
      .collect();

    const documents = await Promise.all(
      shares.map(async (share) => {
        const doc = await ctx.db.get(share.documentId);
        return {
          ...doc,
          permissions: share.permissions,
        };
      })
    );

    return documents;
  },
});

// Cursor presence for real-time collaboration
export const updateCursorPosition = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
    userName: v.string(),
    position: v.number(),
    userColor: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("cursorPositions", {
      documentId: args.documentId,
      userId: args.userId,
      userName: args.userName,
      position: args.position,
      userColor: args.userColor,
      timestamp: Date.now(),
    });
  },
});

export const getCursorPositions = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const cursors = await ctx.db
      .query("cursorPositions")
      .filter((q) => q.eq(q.field("documentId"), args.documentId))
      .collect();

    // Filter out cursors older than 30 seconds
    const now = Date.now();
    return cursors.filter((c) => now - c.timestamp < 30000);
  },
});
