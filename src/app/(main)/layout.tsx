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
        <div className="flex min-h-screen bg-slate-50 font-inter">
          <Sidebar />

          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Navbar />

            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </RoleProvider>
    </TranstackProvider>
  );
}
