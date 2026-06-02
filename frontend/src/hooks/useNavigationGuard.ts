import { useCallback } from "react"
import { useBlocker, type Location } from "react-router-dom"

/**
 * Blocks navigation away from the current page when `shouldBlock` is true,
 * and exposes the blocker state so the component can render a confirmation modal.
 */
export const useNavigationGuard = (shouldBlock: boolean) => {
  const blocker = useBlocker(
    useCallback(
      ({
        currentLocation,
        nextLocation,
      }: {
        currentLocation: Location
        nextLocation: Location
      }) => shouldBlock && currentLocation.pathname !== nextLocation.pathname,
      [shouldBlock]
    )
  )

  return {
    isBlocked: blocker.state === "blocked",
    proceed: () => blocker.proceed?.(),
    cancel: () => blocker.reset?.(),
  }
}
