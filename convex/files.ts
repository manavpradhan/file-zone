import {MutationCtx, QueryCtx, internalAction, mutation, query} from "./_generated/server"
import {ConvexError, v} from "convex/values"
import { getUser } from "./users";
import { fileTypes } from "./schema";

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
        fileId: v.id("_storage"),
        type: fileTypes,
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
            type: args.type,
        })
    }

})

export const getFiles = query({
    args: {
        orgId: v.string(),
        query: v.string(),
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

        const files = await ctx.db.query("files").withIndex("by_orgId", q => q.eq('orgId', args.orgId)).collect();

        const query = args.query;
        
        if(query){
            return files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()));
        }else{
            return files;
        }
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

export const toggleFavorite = mutation({
    args: {
        fileId: v.id("files"), 
    },
    async handler(ctx, args){
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError("You must be logged in, to perform this action")
        }

        const file = await ctx.db.get(args.fileId)
        if(!file){
            throw new ConvexError("This file does not exist")
        }

        const hasAccess = await hasAccessToOrg(ctx, file.orgId, identity.tokenIdentifier)
        if (!hasAccess){
            throw new ConvexError("You do not have access to this organization!")
        }

        const user = await getUser(ctx, identity.tokenIdentifier)

        const favorite = await ctx.db.query("favorites").withIndex("by_userId_orgId_fileId", q=>q.eq("userId", user._id).eq("orgId", file.orgId).eq("fileId", file._id)).first();

        if(!favorite){
            // Add favorite
            await ctx.db.insert("favorites", {fileId: file._id,  userId: user._id, orgId: file.orgId});
        }else{
            // Delete favorite
            await ctx.db.delete(favorite._id);
        }
    }
})