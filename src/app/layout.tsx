import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MassDwell Finish Selection Portal',
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
        <div className="min-h-screen bg-gray-50">
          <header className="bg-deep-navy text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold">MassDwell</h1>
                  <span className="ml-3 text-sm opacity-80">Finish Selection Portal</span>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-soft-denim text-white py-8 mt-12">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <p className="text-sm opacity-80">
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