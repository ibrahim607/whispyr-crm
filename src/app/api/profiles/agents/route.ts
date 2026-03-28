import { authenticateUser, AuthenticationError } from "@/utils/autheticateUser";
import { NextResponse } from "next/server";
import { listAgents } from "@/modules/profiles/service";

export async function GET() {
  try {
    // Authenticate user (any role can see the agents list, but restricted usually to managers/admins for assignment)
    // We'll allow any authenticated user for now as the front-end might need it in various places
    await authenticateUser();

    const agents = await listAgents();

    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Failed to fetch agents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
