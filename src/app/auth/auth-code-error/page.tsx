import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
            <div className="w-full max-w-sm text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-red-500/10 p-4 rounded-full">
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-white">
                        Authentication Error
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Something went wrong during sign in. Please try again.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/login"
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                    >
                        Try again
                    </Link>
                    <Link
                        href="/"
                        className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
                    >
                        Go back to timer
                    </Link>
                </div>
            </div>
        </div>
    )
}
