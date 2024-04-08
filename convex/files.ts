import {MutationCtx, QueryCtx, internalAction, mutation, query} from "./_generated/server"
import {ConvexError, v} from "convex/values"
import { getUser } from "./users";

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string, tokenIdentifier: string) {
    const user = await getUser(ctx, tokenIdentifier)
    const hasAccess = user.orgIds.includes(orgId)

    return hasAccess;
}

export const createFile = mutation({
    args: {
        name: v.string(),
        orgId: v.string(),
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

export const newFunc = internalAction({
    args: {},
    async handler(ctx, args){

    }
})