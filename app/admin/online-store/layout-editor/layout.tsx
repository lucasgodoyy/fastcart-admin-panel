export default function LayoutEditorLayout({ children }: { children: React.ReactNode }) {
  // Full-screen layout — no admin sidebar/header
  return <>{children}</>;
}
