import { create } from 'zustand'
import { AuthState, AuthUser, Profile, Company, Subscription } from '@/types/auth.types'
import { resetActiveCompanyCurrency } from '@/lib/active-company-currency'

interface AuthStore extends AuthState {
  setAuth: (payload: Partial<AuthState>) => void
  setUser: (user: AuthUser | null) => void
  setProfile: (profile: Profile | null) => void
  setCompany: (company: Company | null) => void
  setSubscription: (subscription: Subscription | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  company: null,
  subscription: null,
  plan: null,
  limits: null,
  isLoading: true,
  
  setAuth: (payload) => set((state) => ({ ...state, ...payload })),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setCompany: (company) => set({ company }),
  setSubscription: (subscription) => set({ subscription }),
  clearAuth: () => {
    resetActiveCompanyCurrency()
    set({
      user: null,
      profile: null,
      company: null,
      subscription: null,
      plan: null,
      limits: null,
      isLoading: false,
    })
  },
}))
