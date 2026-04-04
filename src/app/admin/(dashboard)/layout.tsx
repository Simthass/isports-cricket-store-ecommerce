import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import Providers from "@/components/admin/Providers"; // <-- Import the new provider

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    // Wrap the UI in the Providers component
    <Providers>
      <div className="flex h-screen bg-[#f4f6fb]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Pass the session down directly as a prop */}
          <AdminHeader session={session} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
