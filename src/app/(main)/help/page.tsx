import { Mail, MessageCircle, FileText, ChevronRight, HelpCircle } from "lucide-react";

export default function HelpSupportPage() {
  const faqs = [
    {
      question: "How do I create a new class?",
      answer: "Navigate to the Classes section from the sidebar and click on the 'Create Class' button in the top right. Fill in the class details and save.",
    },
    {
      question: "How can I invite students to my class?",
      answer: "Once a class is created, go to the Students tab inside that class and click 'Invite Students'. You can share the class code or send email invitations.",
    },
    {
      question: "How do I upgrade my account to Premium?",
      answer: "Click on the 'Upgrade Premium' button in the sidebar or visit your Billing settings to view and select available subscription plans.",
    },
    {
      question: "Can I track student performance?",
      answer: "Yes, use the Reports and Analytics sections to see detailed insights on student progress, completion rates, and test scores.",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          Help & Support
        </h1>
        <p className="mt-2 text-slate-500">
          Find answers to common questions or get in touch with our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Documentation</h3>
          <p className="text-sm text-slate-500 mb-4">
            Read our detailed guides and tutorials to get the most out of ESOL Master.
          </p>
          <button className="mt-auto text-primary font-semibold text-sm flex items-center gap-1 hover:underline">
            Read Docs <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Live Chat</h3>
          <p className="text-sm text-slate-500 mb-4">
            Chat instantly with our support agents. Available 24/7 for premium users.
          </p>
          <button className="mt-auto text-primary font-semibold text-sm flex items-center gap-1 hover:underline">
            Start Chat <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Email Support</h3>
          <p className="text-sm text-slate-500 mb-4">
            Send us an email anytime and we'll get back to you within 24 hours.
          </p>
          <button className="mt-auto text-primary font-semibold text-sm flex items-center gap-1 hover:underline">
            Contact Us <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100/90 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-slate-100/90">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6">
              <h4 className="text-[15px] font-bold text-slate-800 mb-2">{faq.question}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
