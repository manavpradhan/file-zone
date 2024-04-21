import {
  MutationCtx,
  QueryCtx,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";
import { fileTypes } from "./schema";

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string,
  tokenIdentifier: string
) {
  const user = await getUser(ctx, tokenIdentifier);
  const hasAccess = user.orgIds.some((item) => item.orgId === orgId);

  const isAdmin =
    user.orgIds.find((item) => item.orgId === orgId)?.role === "admin";

  return { hasAccess, isAdmin, user };
}

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("You must be logged in, to upload a file");
  }

  return await ctx.storage.generateUploadUrl();
});

export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
    fileId: v.id("_storage"),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    console.log(identity);
    if (!identity) {
      throw new ConvexError("You must be logged in, to upload a file");
    }

    const { hasAccess, user } = await hasAccessToOrg(
      ctx,
      args.orgId,
      identity.tokenIdentifier
    );
    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization!");
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      userId: user._id,
      type: args.type,
      markAsDelete: false,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.string(),
    type: v.optional(fileTypes),
    favorites: v.optional(v.boolean()),
    trash: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You are not logged in!");
    }

    const user = await getUser(ctx, identity.tokenIdentifier);

    const { hasAccess } = await hasAccessToOrg(
      ctx,
      args.orgId,
      identity.tokenIdentifier
    );
    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization!");
    }

    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    if (args.trash) {
      files = files.filter((file) => file.markAsDelete === true);
    } else {
      files = files.filter((file) => file.markAsDelete === false);
    }

    if (args.favorites) {
      const favFiles = await ctx.db
        .query("favorites")
        .withIndex("by_userId_orgId_fileId", (q) =>
          q.eq("userId", user._id).eq("orgId", args.orgId)
        )
        .collect();

      files = files.filter((file) => {
        return favFiles.some((f) => f.fileId === file._id);
      });
    }

    const query = args.query;

    if (query) {
      return files.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (args.type) {
      return files.filter((file) => file.type === args.type);
    }

    return files;
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
    // storageId: v.id("_storage"),
    // markAsDelete: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in, to delete a file");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("This file does not exist");
    }

    const { hasAccess, isAdmin } = await hasAccessToOrg(
      ctx,
      file.orgId,
      identity.tokenIdentifier
    );
    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization!");
    }

    if (!isAdmin) {
      throw new ConvexError("You do not have admin rights!");
    }

    await ctx.db.patch(args.fileId, {
      markAsDelete: true,
    });

    // await ctx.db.delete(args.fileId);

    // await ctx.storage.delete(args.storageId);
  },
});

export const restoreFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in, to delete a file");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("This file does not exist");
    }

    const { hasAccess, isAdmin } = await hasAccessToOrg(
      ctx,
      file.orgId,
      identity.tokenIdentifier
    );
    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization!");
    }

    if (!isAdmin) {
      throw new ConvexError("You do not have admin rights!");
    }

    await ctx.db.patch(args.fileId, {
      markAsDelete: false,
    });
  },
});

export const deletePermanently = internalMutation({
  args: {},
  async handler(ctx, args) {
    const files = await ctx.db
      .query("files")
      .withIndex("marked_delete", (q) => q.eq("markAsDelete", true))
      .collect();

    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.fileId);
        return await ctx.db.delete(file._id);
      })
    );
    // files.forEach(async (file) => {
    //   await ctx.db.delete(file._id);
    //   await ctx.storage.delete(file.fileId);
    // });
  },
});

export const toggleFavorite = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in, to perform this action");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("This file does not exist");
    }

    const { hasAccess } = await hasAccessToOrg(
      ctx,
      file.orgId,
      identity.tokenIdentifier
    );
    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization!");
    }

    const user = await getUser(ctx, identity.tokenIdentifier);

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", user._id).eq("orgId", file.orgId).eq("fileId", file._id)
      )
      .first();

    if (!favorite) {
      // Add favorite
      await ctx.db.insert("favorites", {
        fileId: file._id,
        userId: user._id,
        orgId: file.orgId,
      });
    } else {
      // Delete favorite
      await ctx.db.delete(favorite._id);
    }
  },
});

export const myFavorites = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You are not logged in!");
    }

    const user = await getUser(ctx, identity.tokenIdentifier);

    const { hasAccess } = await hasAccessToOrg(
      ctx,
      args.orgId,
      identity.tokenIdentifier
    );
    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization!");
    }

    const favoriteFiles = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", user._id).eq("orgId", args.orgId)
      )
      .collect();

    return favoriteFiles;
  },
});
