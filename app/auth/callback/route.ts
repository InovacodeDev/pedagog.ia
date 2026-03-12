import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Exchange the code for a session
    const response = NextResponse.redirect(`${origin}${next}`);

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (data?.session?.user) {
        try {
          // Import dynamicly to avoid Server Actions edge compatibility issues if any
          const { initializeUserAccountAction } = await import('@/server/actions/onboarding');
          await initializeUserAccountAction();
        } catch (err) {
          console.error('Failed to initialize user account', err);
        }
      }
      return response;
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
