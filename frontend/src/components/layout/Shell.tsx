import { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  Baby,
  Star,
  Clock,
  Timer,
  Scale,
  Droplets,
  Settings,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Plus,
  Check,
  Wind,
  LayoutDashboard,
  Bell,
  Cake,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useApp } from "@/contexts/AppContext"
import { formatAge, isBirthday } from "@/utils/age"
import { cn } from "@/lib/utils"
import { ReminderScheduler } from "./ReminderScheduler"
import { InstallBanner } from "./InstallBanner"
import { UpdateBanner } from "./UpdateBanner"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"
import { DataPrivacyNote } from "@/components/DataPrivacyNote"
import { QuickAddFab } from "./QuickAddFab"
import { BabyAvatar } from "@/components/common/BabyAvatar"
import { config } from "@/config"

const FEATURE_NAV = [
  { path: "/milestones", labelKey: "nav.milestones", icon: Star },
  { path: "/routine", labelKey: "nav.routine", icon: Clock },
  { path: "/feeding", labelKey: "nav.feeding", icon: Timer },
  { path: "/weight", labelKey: "nav.weight", icon: Scale },
  { path: "/diaper", labelKey: "nav.diaper", icon: Droplets },
  { path: "/reminders", labelKey: "nav.reminders", icon: Bell },
  { path: "/white-noise", labelKey: "nav.whiteNoise", icon: Wind },
]

const ALL_PAGES = [
  { path: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { path: "/babies", labelKey: "nav.babies", icon: Baby },
  ...FEATURE_NAV,
  { path: "/settings", labelKey: "nav.settings", icon: Settings },
]

export const Shell = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { babies, activeBaby, setActiveBabyId } = useApp()
  const location = useLocation()
  const navigate = useNavigate()

  const currentPage = ALL_PAGES.find((n) =>
    location.pathname.startsWith(n.path)
  )

  const closeDrawerAndNavigate = (path: string) => {
    setDrawerOpen(false)
    navigate(path)
  }

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <ReminderScheduler />
      {/* Install / update banners */}
      <UpdateBanner />
      <InstallBanner />

      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("shell.openNav")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold">
            {currentPage ? t(currentPage.labelKey) : config.VITE_APP_NAME}
          </span>
          {activeBaby ? (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-0.5 text-left"
              aria-label={t("shell.switchBaby")}
            >
              <span className="truncate text-xs text-muted-foreground">
                {activeBaby.name} · {formatAge(activeBaby.dob)}
              </span>
              {isBirthday(activeBaby.dob) && (
                <Cake className="h-3 w-3 shrink-0 text-pink-500" />
              )}
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/babies")}
              className="flex items-center gap-0.5 text-left"
              aria-label={t("shell.addBaby")}
            >
              <span className="text-xs font-medium text-primary">
                {t("shell.addBaby")}
              </span>
              <ChevronRight className="h-3 w-3 shrink-0 text-primary" />
            </button>
          )}
        </div>
        <LanguageToggle />
        <ThemeToggle />
      </header>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Side drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background shadow-xl transition-transform duration-200",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <span className="font-semibold tracking-tight">
            {config.VITE_APP_NAME}
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t("shell.closeNav")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Baby selector section */}
        <div className="px-3 pt-4 pb-3">
          <div className="mb-2 px-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {t("shell.babySection")}
          </div>

          {babies.length === 0 ? (
            <div className="rounded-lg border border-dashed px-3 py-4 text-center">
              <Baby className="mx-auto mb-1.5 h-5 w-5 text-muted-foreground" />
              <p className="mb-0.5 text-xs font-medium">
                {t("shell.noBabyYet")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("shell.addOneToStart")}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {babies.map((baby) => (
                <button
                  key={baby.id}
                  onClick={() => {
                    setActiveBabyId(baby.id)
                    setDrawerOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors",
                    activeBaby?.id === baby.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <BabyAvatar name={baby.name} sex={baby.sex} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{baby.name}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {formatAge(baby.dob)}
                      {isBirthday(baby.dob) && (
                        <Cake className="h-3 w-3 shrink-0 text-pink-500" />
                      )}
                    </div>
                  </div>
                  {activeBaby?.id === baby.id && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => closeDrawerAndNavigate("/babies")}
            className="mt-1.5 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <span>{t("shell.addManageBabies")}</span>
          </button>
        </div>

        {/* Divider + Tracking section */}
        <div className="mx-3 border-t" />
        <nav className="flex-1 px-3 pt-3">
          <div className="mb-2 px-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {t("shell.featuresSection")}
          </div>
          <div className="flex flex-col gap-0.5">
            <NavLink
              to="/dashboard"
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="flex-1">{t("nav.dashboard")}</span>
              <ChevronRight className="h-3.5 w-3.5 opacity-40" />
            </NavLink>
            {FEATURE_NAV.map(({ path, labelKey, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{t(labelKey)}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Settings + privacy note */}
        <div className="border-t px-3 py-2">
          <NavLink
            to="/settings"
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span className="flex-1">{t("nav.settings")}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
          </NavLink>
          <div className="px-3 pt-2">
            <DataPrivacyNote />
          </div>
          <a
            href="https://ko-fi.com/yourpage"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            🍼 {t("shell.buyMeADiaper")}
          </a>
        </div>
      </aside>

      {/* Page content — leaves space for bottom nav on mobile */}
      <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">{children}</main>

      {/* Desktop footer */}
      <footer className="hidden shrink-0 items-center justify-center border-t py-2 sm:flex">
        <a
          href="https://ko-fi.com/yourpage"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          🍼 {t("shell.buyMeADiaper")}
        </a>
      </footer>

      <QuickAddFab />

      {/* Bottom nav (mobile only) — tracking features only, no Children tab */}
      <nav className="fixed right-0 bottom-0 left-0 z-30 flex h-16 border-t bg-background sm:hidden">
        {FEATURE_NAV.map(({ path, labelKey, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
