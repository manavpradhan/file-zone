import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(v.literal("image"), v.literal("txt"), v.literal("csv"), v.literal("pdf"))
export const roles = v.union(v.literal("admin"), v.literal("member"))

export default defineSchema({
  files: defineTable({ name: v.string(), orgId: v.string(), fileId: v.id("_storage"), userId: v.id("users"), type: fileTypes, markAsDelete: v.optional(v.boolean())}).index("by_orgId", ["orgId"]).index("marked_delete", ['markAsDelete']),
  users: defineTable({ tokenIdentifier: v.string(), name: v.string(), image: v.string(), orgIds: v.array(v.object({orgId: v.string(), role: roles}))}).index("by_tokenIdentfier", ["tokenIdentifier"]),
  favorites: defineTable({fileId: v.id("files"), orgId: v.string(), userId: v.id("users")}).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"]),
});