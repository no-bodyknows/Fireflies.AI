'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderKanban,
  Sparkles,
  Bot,
  BarChart3,
  MessageSquareQuote,
  Radio,
  Sliders,
  Sun,
  Moon,
  ChevronDown,
  Layers,
  X
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string | null;
  isAction?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenLiveBot?: () => void;
  onOpenSettings?: () => void;
  onOpenIntegrations?: () => void;
  onOpenSoundbites?: () => void;
  onOpenAnalytics?: () => void;
  onOpenAskFred?: () => void;
}

export default function Sidebar({
  darkMode,
  setDarkMode,
  isMobileOpen = false,
  onCloseMobile,
  onOpenLiveBot,
  onOpenSettings,
  onOpenIntegrations,
  onOpenSoundbites,
  onOpenAnalytics,
  onOpenAskFred,
}: SidebarProps) {
  const pathname = usePathname();

  const navLinks: NavItem[] = [
    { label: 'Notebook / Meetings', href: '/', icon: FolderKanban, badge: null },
    { label: 'AskFred AI', href: '#askfred', icon: Bot, badge: 'AI', isAction: true, onClick: onOpenAskFred },
    { label: 'Soundbites', href: '#soundbites', icon: MessageSquareQuote, badge: null, isAction: true, onClick: onOpenSoundbites },
    { label: 'Analytics & Trends', href: '#analytics', icon: BarChart3, badge: null, isAction: true, onClick: onOpenAnalytics },
    { label: 'Channels', href: '#channels', icon: Radio, badge: 'Soon', isAction: true },
    { label: 'Apps & Integrations', href: '#integrations', icon: Layers, badge: null, onClick: onOpenIntegrations },
    { label: 'Settings', href: '#settings', icon: Sliders, badge: null, onClick: onOpenSettings },
  ];

  const handleNavClick = (item: NavItem) => {
    if (onCloseMobile) onCloseMobile();
    if (item.onClick) item.onClick();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
          <Link href="/" onClick={onCloseMobile} className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  fireflies<span className="text-pink-500">.ai</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">Workspace</span>
            </div>
          </Link>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className={`p-1.5 rounded-lg lg:hidden ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Action: Add to Live Meeting */}
        <div className="p-3">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              if (onOpenLiveBot) onOpenLiveBot();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20 hover:shadow-violet-500/35 transition-all group"
          >
            <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>+ Add to live meeting</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Workspace
          </p>

          {navLinks.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href && !item.isAction && !item.onClick;

            if (item.onClick) {
              return (
                <button
                  key={idx}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    darkMode
                      ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 opacity-75" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            if (item.isAction) {
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    darkMode
                      ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    if (item.label === 'AskFred AI' && onOpenLiveBot) onOpenLiveBot();
                  }}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 opacity-75" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      item.badge === 'AI'
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={idx}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                    : darkMode
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 opacity-85" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        {/* Storage & Limits Indicator */}
        <div className={`p-3 mx-3 mb-2 rounded-xl border text-xs ${
          darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex justify-between items-center mb-1 text-[11px] font-semibold">
            <span>Minutes Used</span>
            <span className="text-violet-600 dark:text-violet-400 font-bold">820 / 1000</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full" style={{ width: '82%' }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Pro Plan • Renews in 18 days</p>
        </div>

        {/* Footer / Profile & Theme Toggle */}
        <div className={`p-3 border-t space-y-2 ${darkMode ? 'border-slate-800/80 bg-[#0a0c14]' : 'border-slate-100 bg-slate-50/50'}`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <div className="flex items-center space-x-2">
              {darkMode ? <Moon className="w-3.5 h-3.5 text-violet-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{darkMode ? 'Dark Appearance' : 'Light Appearance'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-500 font-bold">Switch</span>
          </button>

          <div
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              if (onOpenSettings) onOpenSettings();
            }}
            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
              darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                LK
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">Love Kumar</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-none">love@fireflies.ai</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (>= lg) */}
      <aside
        className={`hidden lg:flex w-64 border-r flex-col h-screen sticky top-0 transition-colors z-30 shrink-0 ${
          darkMode ? 'bg-[#0e101a] border-slate-800/80 text-slate-100' : 'bg-white border-slate-200/90 text-slate-900'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer (< lg) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          {/* Drawer Sidebar */}
          <aside
            className={`relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-50 transition-colors animate-in slide-in-from-left duration-200 ${
              darkMode ? 'bg-[#0e101a] text-slate-100 border-r border-slate-800' : 'bg-white text-slate-900 border-r border-slate-200'
            }`}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
