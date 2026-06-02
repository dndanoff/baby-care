import { Outlet } from "react-router-dom"
import { Shell } from "@/components/layout/Shell"

const App = () => {
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}

export default App
