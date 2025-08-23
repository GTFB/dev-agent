'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { LogIn, LogOut, User, Loader2 } from 'lucide-react';

interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className = '' }: LoginButtonProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <button
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${className}`}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {session.user?.name || session.user?.email}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <LogOut className="h-3 w-3 mr-1" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      <LogIn className="h-4 w-4 mr-2" />
      Sign In
    </button>
  );
}
