"use server";

import { cookies } from "next/headers";

export async function setRegistrationCookie(data: {
  firstName: string;
  lastName: string;
  jobTitle: string;
  enrollmentId: string;
}) {
  const cookieStore = await cookies();
  cookieStore.set("registration_data", JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });
}

export async function deleteRegistrationCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("registration_data");
}
