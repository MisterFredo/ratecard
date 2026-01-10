import PublicClientLayout from "./PublicClientLayout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicClientLayout>{children}</PublicClientLayout>;
}
