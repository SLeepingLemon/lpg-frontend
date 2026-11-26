import { createContext } from 'react'

// Kept separate from AuthContext.jsx so that file only exports components (fast refresh).
export const AuthContext = createContext(null)
