import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId } = await auth();
    
    if (!userId) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Get the allowed emails from environment variable
    const emailsEnv = process.env.EMAILS || '';
    const allowedEmails = emailsEnv
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
    
    // Only validate emails if EMAILS is configured
    if (allowedEmails.length > 0) {
      try {
        // Fetch user from Clerk to get email
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
        
        // Only allow if email exactly matches one in the allowed list
        if (!userEmail || !allowedEmails.includes(userEmail)) {
          // User's email is not in the allowed list
          const signInUrl = new URL('/sign-in?error=unauthorized', req.url);
          return NextResponse.redirect(signInUrl);
        }
      } catch (error) {
        // If we can't fetch the user, redirect to sign-in
        const signInUrl = new URL('/sign-in', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }
    // If EMAILS is not configured, allow access (for development/testing)
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

