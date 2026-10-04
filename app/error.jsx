'use client';

export default function GlobalError({ reset }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">حصلت مشكلة / Something went wrong</h1>
      <p className="text-gray-500 mb-6 text-sm">حاول تاني بعد شوية. / Please try again.</p>
      <button onClick={() => reset()} className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-full">
        إعادة المحاولة / Retry
      </button>
    </div>
  );
}
