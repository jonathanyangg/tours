'use client'

import { useActionState } from 'react'
import { login } from './actions'

interface LoginState {
  error: string
  isLoading: boolean
}

export default function LoginPage() {
  const initialState: LoginState = { error: '', isLoading: false }
  const [state, formAction] = useActionState(login, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-xl shadow-lg">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center">Welcome back</h1>
          <p className="text-center text-sm text-gray-600">Please enter your details to sign in</p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" action={formAction}>
          {state?.error && (
            <div className="p-3 sm:p-4 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs sm:text-sm text-red-600 font-medium">{state.error}</p>
            </div>
          )}
          
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email" 
                type="email"
                required
                className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 transition duration-150 ease-in-out text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 transition duration-150 ease-in-out text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 px-4 bg-blue-600/90 text-white font-medium rounded-lg hover:bg-blue-700/90 transform transition-all duration-150 ease-in-out hover:scale-[1.02] cursor-pointer active:bg-blue-800/90 active:scale-[0.99] text-sm"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}