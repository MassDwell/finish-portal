'use client'

import { useState, useEffect } from 'react'
import { AdminLogin } from '@/components/AdminLogin'
import { AdminDashboard } from '@/components/AdminDashboard'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is already authenticated
    const adminAuth = localStorage.getItem('massdwell_admin_auth')
    if (adminAuth) {
      try {
        const authData = JSON.parse(adminAuth)
        const now = new Date().getTime()
        
        // Check if auth is still valid (24 hours)
        if (authData.expires && authData.expires > now) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('massdwell_admin_auth')
        }
      } catch {
        localStorage.removeItem('massdwell_admin_auth')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (password: string): boolean => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'massdwell2026'
    
    if (password === adminPassword) {
      const expires = new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
      localStorage.setItem('massdwell_admin_auth', JSON.stringify({ expires }))
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    localStorage.removeItem('massdwell_admin_auth')
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}