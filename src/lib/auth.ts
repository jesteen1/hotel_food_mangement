import { NextAuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db";
import { User, Otp } from "@/lib/models";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "OTP",
            credentials: {
                email: { label: "Email", type: "email" },
                otp: { label: "OTP", type: "text" },
                password: { label: "Password", type: "password" },
                companyName: { label: "Company Name", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email) {
                    throw new Error("Invalid credentials");
                }

                await connectToDatabase();

                // 1. Password Login Flow
                if (credentials.password) {
                    const user = await User.findOne({ email: credentials.email });
                    if (!user) {
                        throw new Error("UserNotFound");
                    }
                    if (!user.hasSetPassword || !user.password) {
                        throw new Error("PasswordNotSet");
                    }

                    const bcrypt = await import('bcryptjs');
                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        throw new Error("InvalidPassword");
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.email,
                        companyName: user.companyName
                    };
                }

                // 2. OTP Login Flow
                if (!credentials.otp) {
                    throw new Error("Invalid credentials");
                }

                const otpRecord = await Otp.findOne({ email: credentials.email });

                if (!otpRecord) {
                    throw new Error("Invalid OTP");
                }

                if (otpRecord.otp !== credentials.otp) {
                    throw new Error("Invalid OTP");
                }

                if (new Date() > otpRecord.expiresAt) {
                    throw new Error("OTP Expired");
                }

                // OTP Valid - Clean up
                await Otp.deleteOne({ _id: otpRecord._id });

                try {
                    // Find or Create User (OTP Flow)
                    let user = await User.findOne({ email: credentials.email });
                    // ... existing user creation logic ...
                    if (user) {
                        if (!user.companyName && credentials.companyName) {
                            console.log("Updating existing user with company:", credentials.companyName);
                            user.companyName = credentials.companyName;
                            await user.save();
                        }
                    } else {
                        // Only allow creation via OTP (which is this flow)
                        console.log("Creating new user with company:", credentials.companyName);
                        user = await User.create({
                            email: credentials.email,
                            companyName: credentials.companyName || "",
                        });

                        try {
                            const { sendWelcomeEmail } = await import("@/lib/email");
                            sendWelcomeEmail(user.email);
                            const { seedDefaultProducts } = await import("@/lib/seeder");
                            seedDefaultProducts(user.email);
                        } catch (emailError) {
                            console.error("Failed to run post-creation tasks:", emailError);
                        }
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.email,
                        companyName: user.companyName
                    };
                } catch (error) {
                    console.error("Authorize Error:", error);
                    throw new Error("Internal Server Error during creation");
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await connectToDatabase();
                try {
                    const existingUser = await User.findOne({ email: user.email });
                    if (!existingUser) {
                        console.log("Creating new user via Google:", user.email);
                        const newUser = await User.create({
                            email: user.email,
                            name: user.name || "",
                            image: user.image || "",
                            companyName: "" // Default empty
                        });

                        // Seed Data
                        try {
                            const { sendWelcomeEmail } = await import("@/lib/email");
                            sendWelcomeEmail(newUser.email);
                            const { seedDefaultProducts } = await import("@/lib/seeder");
                            seedDefaultProducts(newUser.email);
                        } catch (emailError) {
                            console.error("Failed to run post-creation tasks (Google):", emailError);
                        }
                    }
                    return true;
                } catch (error) {
                    console.error("Google Sign In Error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.companyName = (user as any).companyName;
            }
            if (trigger === "update" && session?.companyName) {
                token.companyName = session.companyName;
            }
            // If checking DB freshly on every request is too slow, rely on token
            // But if we want real-time companyName updates, we might fetch here?
            // For now, keep as is.
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).companyName = token.companyName as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours (1 day) exactly
    },
    debug: true,
};
