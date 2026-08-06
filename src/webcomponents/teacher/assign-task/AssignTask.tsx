"use client";

import { SectionHeading } from "@/webcomponents/reusable";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AssignTaskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define tabs configuration
  const tabs = [
    { name: "Reading", path: "/assign-task/reading" },
    { name: "Vocabulary", path: "/assign-task/vocubulary" },
    { name: "Grammar", path: "/assign-task/grammar" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        heading="Assign Task"
        subheading="Create and assign new tasks to your classes."
      />

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-2" aria-label="Task Categories">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                pathname === tab.path
                  ? "bg-primary text-white" // Active tab styling
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200" // Inactive tab styling
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab Content - Using children to render the nested page */}
      <div className="mt-4">{children}</div>
    </div>
  );
}
