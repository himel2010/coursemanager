"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import axios from "axios"
import { useRouter } from "next/navigation"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
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
  }, [userProfile])

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

  // ⭐ REPLACE YOUR OLD useEffect WITH THIS
  useEffect(() => {
    let initialized = false

    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }

      initialized = true
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // ⭐ Skip the immediate fire
      if (!initialized) return

      const newUserId = session?.user?.id
      const currentUserId = user?.id

      setUser(session?.user ?? null)

      // ⭐ Only fetch if user actually changed
      if (newUserId && newUserId !== currentUserId) {
        await fetchUserProfile(newUserId)
      } else if (!newUserId) {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // Empty dependency array

  const value = {
    user,
    userProfile,
    loading,
    courses,
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    refreshUserProfile: () => user && fetchUserProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
