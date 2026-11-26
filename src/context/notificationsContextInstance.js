import { createContext } from 'react'

// Kept separate from NotificationsContext.jsx so that file only exports components (fast refresh).
export const NotificationsContext = createContext(null)
