import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation } from "./_generated/server";


export async function getUser(ctx: QueryCtx | MutationCtx, tokenIdentifier: string) {
    const user = await ctx.db.query("users").withIndex("by_tokenIdentfier", q=>q.eq("tokenIdentifier", tokenIdentifier)).first();
    if (!user){
        throw new ConvexError("No such user found with given token!");
    }

    return user;
} 

export const createUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        name: v.string(),
        image: v.string(),
        userId: v.string(),
    },
    async handler(ctx, args){
        await ctx.db.insert("users", {
            tokenIdentifier: args.tokenIdentifier,
            name: args.name,
            image: args.image,
            orgIds: [],
        })

        const user = await getUser(ctx, args.tokenIdentifier)
        await ctx.db.patch(user._id, {
            orgIds: [...user.orgIds, args.userId]
        })
        await ctx.db.patch(user._id, {
            orgIds: [...user.orgIds, args.userId]
        })
    }
})

export const addOrgIdtoUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
    },
    async handler(ctx, args){
        const user = await getUser(ctx, args.tokenIdentifier)
        await ctx.db.patch(user._id, {
            orgIds: [...user.orgIds, args.orgId]
        })
    }
})