import { clerkClient, verifyToken } from "@clerk/express";

class UserService {

    async verifyUserByClerkToken(clerkToken: string) {
        try {
            const user = await verifyToken(clerkToken, {
                secretKey: process.env.CLERK_SECRET_KEY || ''
            })
            return user?.sub;
        } catch (error) {
            throw new Error('Invalid Clerk token');
        }
    }

    async getUserByClerkUserId(clerkUserId: string) {
        try {
            const user = await clerkClient.users.getUser(clerkUserId);
            if (!user) {
                throw new Error('User not found');
            }

            const formattedUser = {
                id: user.id,
                name: (user.firstName || '') + " " + (user.lastName || ''),
                email: user.emailAddresses && user.emailAddresses.length > 0 ? user.emailAddresses[0].emailAddress : '',
            }
            return formattedUser;
        } catch (error) {
            throw new Error('Unable to fetch user');
        }
    }

}

export const userService = new UserService();