import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { Baby } from "@/types"
import { babyRepository } from "@/db/repositories"
import { CONSTANTS } from "@/constants"

interface AppContextValue {
  babies: Baby[]
  activeBaby: Baby | null
  activeBabyId: string | null
  setActiveBabyId: (id: string | null) => void
  refreshBabies: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export const AppProvider = ({
  children: reactChildren,
}: {
  children: ReactNode
}) => {
  const [babies, setBabies] = useState<Baby[]>([])
  const [activeBabyId, setActiveBabyIdState] = useState<string | null>(() =>
    localStorage.getItem(CONSTANTS.storage.ACTIVE_BABY_KEY)
  )

  const refreshBabies = async () => {
    const all = await babyRepository.getAll()
    setBabies(all)
    if (activeBabyId && !all.find((b) => b.id === activeBabyId)) {
      setActiveBabyIdState(all[0]?.id ?? null)
    }
  }

  useEffect(() => {
    refreshBabies() // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const setActiveBabyId = (id: string | null) => {
    setActiveBabyIdState(id)
    if (id) {
      localStorage.setItem(CONSTANTS.storage.ACTIVE_BABY_KEY, id)
    } else {
      localStorage.removeItem(CONSTANTS.storage.ACTIVE_BABY_KEY)
    }
  }

  const activeBaby =
    babies.find((b) => b.id === activeBabyId) ?? babies[0] ?? null

  return (
    <AppContext.Provider
      value={{
        babies,
        activeBaby,
        activeBabyId: activeBaby?.id ?? null,
        setActiveBabyId,
        refreshBabies,
      }}
    >
      {reactChildren}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
