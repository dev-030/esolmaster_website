// Full-screen layout for task solving — hides the sidebar & navbar shell
export default function TaskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#F7F9FC] overflow-hidden">
      {children}
    </div>
  );
}
