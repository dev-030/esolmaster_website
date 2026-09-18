import { RoleProvider } from "@/provider/RoleProvider";
import { SubscriptionProvider } from "@/provider/SubscriptionProvider";
import { TranstackProvider } from "@/provider/TranstackProvider";
import { Navbar, Sidebar } from "@/webcomponents/ui";
import { MainContent } from "@/webcomponents/layouts";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TranstackProvider>
      <RoleProvider>
        <SubscriptionProvider>
          <div className="flex min-h-screen bg-[#F7F9FC] font-inter">
            <Sidebar />

            <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
              <Navbar />

              <MainContent>{children}</MainContent>
            </div>
          </div>
        </SubscriptionProvider>
      </RoleProvider>
    </TranstackProvider>
  );
}

