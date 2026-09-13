import { RoleProvider } from "@/provider/RoleProvider";
import { TranstackProvider } from "@/provider/TranstackProvider";
import { Navbar, Sidebar } from "@/webcomponents/ui";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TranstackProvider>
      <RoleProvider>
        <div className="flex min-h-screen bg-[#F7F9FC] font-inter">
          <Sidebar />

          <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
            <Navbar />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </RoleProvider>
    </TranstackProvider>
  );
}
