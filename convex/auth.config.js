import { getAuth } from "@clerk/backend";

export const auth = {
  handlers: {
    onSignOut: async (clerkUser) => {
      // Clean up any user data if needed
      console.log("User signed out:", clerkUser.id);
    },
    onSignIn: async (clerkUser) => {
      // Initialize user data if needed
      console.log("User signed in:", clerkUser.id);
    },
  },
};
