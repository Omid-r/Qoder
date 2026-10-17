import './globals.css';
export const metadata = {
  title: 'Qoder — Splunk Infrastructure Studio',
  description: 'Controlled Network Discovery, Topology Mapping & Splunk SVA Studio',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0B0F17] text-slate-200 antialiased">{children}</body>
    </html>
  );
}
