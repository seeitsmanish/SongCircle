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

    async getUserByUserId(userId: string) {
        try {
            const user = await clerkClient.users.getUser(userId);
            return user;
        } catch (error) {
            throw new Error('Unable to fetch user');
        }
    }

}

export const userService = new UserService();