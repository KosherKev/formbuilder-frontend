export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Blobs - Fixed position to stay while scrolling */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[30%] w-100 h-100 bg-accent/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}