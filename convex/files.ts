import {MutationCtx, QueryCtx, internalAction, mutation, query} from "./_generated/server"
import {ConvexError, v} from "convex/values"
import { getUser } from "./users";

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string, tokenIdentifier: string) {
    const user = await getUser(ctx, tokenIdentifier)
    const hasAccess = user.orgIds.includes(orgId)

    return hasAccess;
}

export const generateUploadUrl = mutation(async (ctx) => {
    
    const identity = await ctx.auth.getUserIdentity();   
    if(!identity){
        throw new ConvexError("You must be logged in, to upload a file")
    }

    return await ctx.storage.generateUploadUrl();
});

export const createFile = mutation({
    args: {
        name: v.string(),
        orgId: v.string(),
        fileId: v.id("_storage")
    },
    async handler(ctx, args){

        const identity = await ctx.auth.getUserIdentity();
        console.log(identity)
        if(!identity){
            throw new ConvexError("You must be logged in, to upload a file")
        }

        const hasAccess = await hasAccessToOrg(ctx, args.orgId, identity.tokenIdentifier)
        if (!hasAccess){
            throw new ConvexError("You do not have access to this organization!")
        }

        await ctx.db.insert("files", {
            name: args.name,
            orgId: args.orgId,
            fileId: args.fileId,
        })
    }

})

export const getFiles = query({
    args: {
        orgId: v.string(),
    },
    async handler(ctx, args){
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            return [];
        }

        const hasAccess = await hasAccessToOrg(ctx, args.orgId, identity.tokenIdentifier)
        if (!hasAccess){
            return [];
        }

        return ctx.db.query("files").withIndex("by_orgId", q => q.eq('orgId', args.orgId)).collect();
    }
})

export const deleteFile = mutation({
    args: {
        fileId: v.id("files"),
        storageId: v.id("_storage"),
    },
    async handler(ctx, args){
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError("You must be logged in, to delete a file")
        }

        const file = await ctx.db.get(args.fileId)
        if (!file){
            throw new ConvexError("This file does not exist")
        }

        const hasAccess = await hasAccessToOrg(ctx, file.orgId, identity.tokenIdentifier)
        if (!hasAccess){
            throw new ConvexError("You do not have access to this organization!")
        }

        await ctx.db.delete(args.fileId);

        await ctx.storage.delete(args.storageId);
    }
})
