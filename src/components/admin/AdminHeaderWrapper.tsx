// src/components/admin/AdminHeaderWrapper.tsx
"use client";

import { useSession } from "next-auth/react";
import AdminHeader from "./AdminHeader";

export default function AdminHeaderWrapper() {
  const { data: session } = useSession();
  return <AdminHeader session={session} />;
}
