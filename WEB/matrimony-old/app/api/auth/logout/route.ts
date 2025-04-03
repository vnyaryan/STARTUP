export async function POST(request: Request) {
  try {
    // Create response
    const response = Response.json({
      success: true,
      message: "Logged out successfully",
    });

    // Remove auth cookie
    response.headers.set("Set-Cookie", "auth_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      {
        success: false,
        error: "An error occurred during logout",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}