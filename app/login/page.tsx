import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-36">
        <AcmeLogo />
      </div>
      <div className="mt-8 w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}