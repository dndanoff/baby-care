import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"

import "./index.css"
import "./i18n"
import App from "./App.tsx"
import Dashboard from "@/pages/Dashboard"
import Babies from "@/pages/Babies"
import Milestones from "@/pages/Milestones"
import Routine from "@/pages/Routine"
import Feeding from "@/pages/Feeding"
import Weight from "@/pages/Weight"
import Diaper from "@/pages/Diaper"
import Settings from "@/pages/Settings"
import WhiteNoise from "@/pages/WhiteNoise"
import Reminders from "@/pages/Reminders"
import { ThemeProvider } from "@/contexts/ThemeContext.tsx"
import { AppProvider } from "@/contexts/AppContext.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "babies", element: <Babies /> },
      { path: "milestones", element: <Milestones /> },
      { path: "routine", element: <Routine /> },
      { path: "feeding", element: <Feeding /> },
      { path: "weight", element: <Weight /> },
      { path: "diaper", element: <Diaper /> },
      { path: "settings", element: <Settings /> },
      { path: "white-noise", element: <WhiteNoise /> },
      { path: "reminders", element: <Reminders /> },
      { path: "*", element: <Navigate to="/babies" replace /> },
    ],
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ThemeProvider>
  </StrictMode>
)
