/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Next.js only exposes NEXT_PUBLIC_* variables to the browser by default.
  // This hands the two PUBLIC Supabase values (project URL + anon/publishable
  // key) to the browser bundle under the exact names set in Vercel.
  // Never list a service-role / secret key here — everything below is shipped
  // to every visitor's browser.
  env: {
    NEXT_SUPABASE_URL: process.env.NEXT_SUPABASE_URL ?? "",
    NEXT_SUPABASE_ANON_KEY: process.env.NEXT_SUPABASE_ANON_KEY ?? "",
  },
};

export default nextConfig;
