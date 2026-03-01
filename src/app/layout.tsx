import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MassDwell Design Studio - Choose Your Finishes',
  description: 'Select your finish options for your MassDwell ADU project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-massdwell-dark">
          <header className="bg-massdwell-card text-massdwell-text shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-massdwell-green">MassDwell</h1>
                  <span className="ml-3 text-sm text-massdwell-secondary">Design Studio</span>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-massdwell-card text-massdwell-text py-8 mt-12">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <p className="text-sm text-massdwell-secondary">
                  © 2026 MassDwell. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}