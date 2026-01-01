export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex items-center justify-center">
      {/* Background Blobs for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-secondary/20 rounded-full blur-[100px]" />
      <div className="absolute top-[40%] left-[60%] w-75 h-75 bg-accent/10 rounded-full blur-[80px]" />

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
