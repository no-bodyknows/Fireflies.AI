import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#0b0d17] text-slate-100">
      <div className="w-12 h-12 rounded-2xl bg-violet-600/15 text-violet-400 flex items-center justify-center mb-4 font-bold text-lg">
        404
      </div>
      <h2 className="text-xl font-bold tracking-tight mb-2">Meeting Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        The meeting note you are looking for has either been moved, deleted, or does not exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
      >
        &larr; Return to Meetings Notebook
      </Link>
    </div>
  );
}
