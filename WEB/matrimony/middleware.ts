// Temporarily disable middleware to test API routes
export const config = {
  matcher: [], // Empty matcher means middleware won't run on any routes
};

export default function middleware() {
  // This won't run due to empty matcher
  return;
}