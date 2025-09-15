import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/toaster";

export default async function MainAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
        <SidebarTrigger className="-m-1" />
        <main className="flex-1">
          {children}
          </main>
      <Toaster/>
    </SidebarProvider>
  );
}

