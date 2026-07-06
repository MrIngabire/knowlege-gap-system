export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      {children}
    </div>
  );
}