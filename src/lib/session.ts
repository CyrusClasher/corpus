import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { ApiError } from "./utils";

export async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    throw new ApiError(401, "You must be signed in to do that.");
  }
  return userId;
}
