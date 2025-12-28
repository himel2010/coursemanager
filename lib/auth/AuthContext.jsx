"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import axios from "axios"
import { redirect, useRouter } from "next/navigation"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const [userProfile, setUserProfile] = useState(null) // Additional user data from Prisma
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (userProfile?.enrollments) {
      const extractedCourses = userProfile.enrollments.map(
        (enrollment) => enrollment.courseOffered
      )
      setCourses(extractedCourses)
    }
  }, [userProfile]) // Run when userProfile changes

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      // Fetch profile when user signs in
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`/api/user/${userId}`)
      console.log("user got", response.data)

      setUserProfile(response.data)
    } catch (error) {
      console.error("Error fetching user profile:", error.response?.data || error.message)
      // Don't fail completely, just set empty profile
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    userProfile, // Prisma user data (name, role, etc.)
    loading,
    courses,
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    refreshUserProfile: () => user && fetchUserProfile(user.id), //extra
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
