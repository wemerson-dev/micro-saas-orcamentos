import ClientLayout from "./client-layout";

export default function MainAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}