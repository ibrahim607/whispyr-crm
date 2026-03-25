import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import createServerSupabaseClient from "@/lib/supabase/server";

export class AuthenticationError extends Error {
    constructor(
        public message: string,
        public statusCode: number
    ) {
        super(message);
        this.name = "autheticationError";
    }
}

export async function authenticateUser(allowedRoles?: Role[]) {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, } = await supabase.auth.getUser();

    if (!user) {
        throw new AuthenticationError("Unauthorized", 401);
    }

    const profile = await prisma.profile.findUnique({
        where: {
            id: user.id
        }
    })

    if (!profile) {
        throw new AuthenticationError("User not found", 404);
    }

    if (!profile.isActive) {
        throw new AuthenticationError("User is not active", 403);
    }

    if (allowedRoles && !allowedRoles.includes(profile.role)) {
        throw new AuthenticationError("Unauthorized", 403);
    }

    return profile;

}