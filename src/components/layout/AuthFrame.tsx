import type { ReactNode } from 'react'

interface AuthFrameProps {
  children: ReactNode
}

export function AuthFrame({ children }: AuthFrameProps) {
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_10%_10%,#fff9f7_0,#fbe8e3_35%,#f6dbd2_100%)] p-4 md:p-8">
      <div className="mx-auto flex min-h-[86vh] w-full max-w-6xl items-center justify-center">
        {children}
      </div>
    </main>
  )
}
