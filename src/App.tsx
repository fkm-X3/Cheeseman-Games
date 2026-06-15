import { useState, useEffect, useCallback } from "react";
import "./App.css";

type Tab = "home" | "games" | "community" | "socials" | "credits" | "settings";

const THEMES = ["default", "light", "midnight", "forest", "sunset", "neon", "ocean", "boykisser67"] as const;

const NAV_ITEMS: { id: Tab; icon: string; label: string; color: string }[] = [
  { id: "home", icon: "fa-house", label: "Home", color: "from-cheeseman-primary/20 to-transparent" },
  { id: "games", icon: "fa-ghost", label: "Games", color: "from-cheeseman-accent/20 to-transparent" },
  { id: "community", icon: "fa-users", label: "Community", color: "from-emerald-500/20 to-transparent" },
  { id: "socials", icon: "fa-share-nodes", label: "Socials", color: "from-cyan-500/20 to-transparent" },
  { id: "credits", icon: "fa-circle-info", label: "Credits", color: "from-amber-500/20 to-transparent" },
];

const GAMES = [
  {
    id: "cubecombat",
    name: "Cube Combat",
    desc: "Physics-based arena brawler.",
    tags: ["HOT"],
    tagColor: "red",
    broken: true,
    gradient: "from-cheeseman-primary/20 to-cheeseman-accent/20",
    borderHover: "border-cheeseman-primary/30",
    shadow: "shadow-cheeseman-primary/10",
    hoverColor: "group-hover:text-cheeseman-primary",
  },
  {
    id: "sketchycasino",
    name: "Sketchy Casino",
    desc: "Try your luck at the tables.",
    tags: ["NEW"],
    tagColor: "red",
    broken: false,
    gradient: "from-red-500/20 to-amber-500/20",
    borderHover: "border-red-500/30",
    shadow: "shadow-red-500/10",
    hoverColor: "group-hover:text-red-400",
  },
  {
    id: "snake",
    name: "Cyber Snake",
    desc: "Classic snake with a neon twist.",
    tags: [],
    tagColor: "emerald",
    broken: false,
    gradient: "from-emerald-500/20 to-green-500/20",
    borderHover: "border-emerald-500/30",
    shadow: "shadow-emerald-500/10",
    hoverColor: "group-hover:text-emerald-400",
    icon: "fa-worm",
  },
  {
    id: "tictactoe",
    name: "Neon Tic-Tac-Toe",
    desc: "Classic strategy game.",
    tags: [],
    tagColor: "indigo",
    broken: false,
    gradient: "from-indigo-500/20 to-purple-500/20",
    borderHover: "border-indigo-500/30",
    shadow: "shadow-indigo-500/10",
    hoverColor: "group-hover:text-indigo-400",
    icon: "fa-x",
  },
  {
    id: "reflex",
    name: "Reflex Tester",
    desc: "Test your reaction speed.",
    tags: [],
    tagColor: "orange",
    broken: false,
    gradient: "from-orange-500/20 to-yellow-500/20",
    borderHover: "border-orange-500/30",
    shadow: "shadow-orange-500/10",
    hoverColor: "group-hover:text-orange-400",
    icon: "fa-bolt",
  },
  {
    id: "breaker",
    name: "Neon Breaker",
    desc: "Break all the bricks.",
    tags: [],
    tagColor: "blue",
    broken: false,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderHover: "border-blue-500/30",
    shadow: "shadow-blue-500/10",
    hoverColor: "group-hover:text-blue-400",
    icon: "fa-shield-halved",
  },
  {
    id: "match",
    name: "Cyber Match",
    desc: "Find matching pairs.",
    tags: [],
    tagColor: "purple",
    broken: false,
    gradient: "from-purple-500/20 to-pink-500/20",
    borderHover: "border-purple-500/30",
    shadow: "shadow-purple-500/10",
    hoverColor: "group-hover:text-purple-400",
    icon: "fa-layer-group",
  },
  {
    id: "highlow",
    name: "Neon High-Low",
    desc: "Higher or lower card game.",
    tags: [],
    tagColor: "yellow",
    broken: false,
    gradient: "from-yellow-500/20 to-amber-500/20",
    borderHover: "border-yellow-500/30",
    shadow: "shadow-yellow-500/10",
    hoverColor: "group-hover:text-yellow-400",
    icon: "fa-arrow-down-up-across-line",
  },
  {
    id: "solitaire",
    name: "Cyber Solitaire",
    desc: "Classic solitaire card game.",
    tags: [],
    tagColor: "green",
    broken: false,
    gradient: "from-green-500/20 to-emerald-500/20",
    borderHover: "border-green-500/30",
    shadow: "shadow-green-500/10",
    hoverColor: "group-hover:text-green-400",
    icon: "fa-diamond",
  },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [theme, setTheme] = useState("default");
  const [gameOverlay, setGameOverlay] = useState<{ visible: boolean; title: string; game: string | null }>({
    visible: false,
    title: "",
    game: null,
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showFps, setShowFps] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("cheeseman-theme") || "default";
    setTheme(savedTheme);
    if (savedTheme !== "default") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("cheeseman-theme", theme);
  }, [theme]);

  const handleSetTheme = useCallback((t: string) => {
    setTheme(t);
  }, []);

  const launchGame = useCallback((gameId: string) => {
    const game = GAMES.find((g) => g.id === gameId);
    if (game) {
      setGameOverlay({ visible: true, title: game.name, game: gameId });
    }
  }, []);

  const closeGame = useCallback(() => {
    setGameOverlay({ visible: false, title: "", game: null });
  }, []);

  const handleToggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.style.setProperty("--transition-speed", "0s");
        document.body.classList.add("reduce-motion");
      } else {
        document.documentElement.style.removeProperty("--transition-speed");
        document.body.classList.remove("reduce-motion");
      }
      localStorage.setItem("cheeseman-setting-reducedMotion", String(next));
      return next;
    });
  }, []);

  const handleToggleShowFps = useCallback(() => {
    setShowFps((prev) => {
      const next = !prev;
      localStorage.setItem("cheeseman-setting-showFps", String(next));
      return next;
    });
  }, []);

  return (
    <div
      className="h-screen flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500 selection:text-white"
      style={{ background: "var(--color-base)", color: "var(--text-main)" }}
    >
      <aside className="hidden md:flex w-20 lg:w-72 flex-col glass z-20 border-r transition-all duration-300"
        style={{ borderColor: "var(--glass-border)" }}
      >
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 relative overflow-hidden group"
          style={{ borderBottom: "1px solid var(--glass-border)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 transform rotate-3 group-hover:rotate-6"
            style={{ boxShadow: "0 10px 15px -3px rgba(99,102,241,0.3)" }}
          >
            <i className="fa-solid fa-gamepad text-white text-xl" />
          </div>
          <div className="ml-4 hidden lg:block">
            <span className="block font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-all">CheeseMan</span>
            <span className="block text-xs font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--color-primary)" }}
            >Games</span>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center p-4 rounded-xl transition-all group relative overflow-hidden"
              style={{
                color: activeTab === item.id ? "var(--text-main)" : "var(--text-muted)",
                background: activeTab === item.id ? "rgba(99,102,241,0.1)" : "transparent",
                border: activeTab === item.id ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => { if (activeTab !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { if (activeTab !== item.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(to right, var(--color-primary)/10, transparent)` }}
              />
              <i className={`fa-solid ${item.icon} text-xl w-8 text-center relative z-10`}
                style={{ color: activeTab === item.id ? "var(--color-primary)" : "inherit" }}
              />
              <span className="ml-3 font-semibold hidden lg:block relative z-10">{item.label}</span>
            </button>
          ))}
          <a
            href="games/slop-index.html"
            className="w-full flex items-center p-4 rounded-xl transition-all group relative overflow-hidden"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <i className="fa-solid fa-trash-can-arrow-up text-xl w-8 text-center relative z-10 group-hover:text-pink-400 transition-colors" />
            <span className="ml-3 font-semibold hidden lg:block relative z-10">The Slop Index</span>
          </a>
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <button
            onClick={() => setActiveTab("settings")}
            className="w-full flex items-center p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/20 group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "rgba(99,102,241,0.2)", color: "var(--color-primary)" }}
              >
                <i className="fa-solid fa-user" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#18181b]" />
            </div>
            <div className="ml-3 hidden lg:block text-left overflow-hidden">
              <p className="text-sm font-bold text-white truncate group-hover:text-[var(--color-primary)] transition-colors">PlayerOne</p>
              <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>Lvl 42 Premium</p>
            </div>
            <i className="fa-solid fa-gear ml-auto hidden lg:block hover:rotate-90 duration-500"
              style={{ color: "var(--text-muted)" }}
            />
          </button>
        </div>
      </aside>

      <header className="md:hidden h-16 glass fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
        style={{ borderBottom: "1px solid var(--glass-border)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-lg flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-gamepad text-white text-sm" />
          </div>
          <span className="font-bold text-lg tracking-tight">CheeseMan Games</span>
        </div>
        <button onClick={() => setActiveTab("settings")}
          className="w-8 h-8 rounded-full overflow-hidden border border-white/30 flex items-center justify-center"
          style={{ background: "rgba(99,102,241,0.2)", color: "var(--color-primary)" }}
        >
          <i className="fa-solid fa-user text-xs" />
        </button>
      </header>

      <main className="flex-1 relative overflow-y-auto overflow-x-hidden pt-16 pb-24 md:pt-0 md:pb-0 z-10"
        id="main-scroll"
      >
        {activeTab === "home" && <HomeView onSwitchTab={setActiveTab} onLaunchGame={launchGame} />}
        {activeTab === "games" && <GamesView onLaunchGame={launchGame} />}
        {activeTab === "community" && <CommunityView />}
        {activeTab === "settings" && (
          <SettingsView
            theme={theme}
            onSetTheme={handleSetTheme}
            reducedMotion={reducedMotion}
            showFps={showFps}
            onToggleReducedMotion={handleToggleReducedMotion}
            onToggleShowFps={handleToggleShowFps}
          />
        )}
        {activeTab === "credits" && <CreditsView />}
        {activeTab === "socials" && <SocialsView />}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass z-50 flex justify-around items-center px-2 pb-2"
        style={{ borderTop: "1px solid var(--glass-border)" }}
      >
        {[
          { id: "home" as Tab, icon: "fa-house" },
          { id: "games" as Tab, icon: "fa-ghost" },
          { id: "socials" as Tab, icon: "fa-share-nodes" },
          { id: "community" as Tab, icon: "fa-users" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center justify-center w-14 h-16 rounded-xl transition-colors"
            style={{ color: activeTab === item.id ? "var(--color-primary)" : "var(--text-muted)" }}
          >
            <i className={`fa-solid ${item.icon} text-xl mb-1`} />
            <span className="text-[10px] font-medium capitalize">{item.id}</span>
          </button>
        ))}
      </nav>

      {gameOverlay.visible && (
        <div className="fixed inset-0 z-[100] flex-col animate-fade-in backdrop-blur-xl bg-black/90"
          style={{ display: gameOverlay.visible ? "flex" : "none" }}
        >
          <div className="flex justify-between items-center p-4"
            style={{ borderBottom: "1px solid var(--glass-border)" }}
          >
            <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {gameOverlay.title}
            </h2>
            <button onClick={closeGame}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-red-500/20 hover:text-red-500"
              style={{ background: "rgba(39,39,42,0.2)" }}
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
            <div className="relative bg-slate-900 rounded-xl shadow-2xl overflow-hidden max-w-full max-h-full"
              style={{ border: "1px solid var(--glass-border)" }}
            >
              <canvas id="game-canvas" width="400" height="400"
                className="max-w-full max-h-[70vh] cursor-crosshair object-contain"
                style={{ display: gameOverlay.game === "reflex" ? "block" : "none" }}
              />
              <iframe id="game-iframe"
                className="w-full h-[80vh] min-w-[80vw] bg-transparent border-0"
                style={{ display: gameOverlay.game && !["reflex", "tictactoe", "match", "highlow", "solitaire"].includes(gameOverlay.game) ? "block" : "none" }}
                allowFullScreen
              />
              {gameOverlay.game === "cubecombat" && (
                <div className="flex items-center justify-center bg-red-600/90 backdrop-blur-sm rounded-2xl border-2 border-red-400 p-12 m-8">
                  <div className="text-center">
                    <i className="fa-solid fa-triangle-exclamation text-6xl text-white mb-4" />
                    <h4 className="text-5xl font-black text-white tracking-wider">BROKEN</h4>
                    <p className="text-white/80 text-sm mt-2">Game temporarily unavailable</p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 backdrop-blur-sm p-6 text-center">
                <h3 className="text-4xl font-black text-white mb-2 italic tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
                  {gameOverlay.game ? "PLAYING" : "READY"}
                </h3>
                <p className="text-slate-300 mb-8 max-w-xs">Enjoy your game session.</p>
                <button onClick={closeGame}
                  className="group relative px-8 py-4 font-bold text-white rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
                  style={{ background: "var(--color-primary)" }}
                >
                  <span className="relative flex items-center gap-2">
                    CLOSE <i className="fa-solid fa-xmark text-xs" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 text-center text-sm border-t border-white/10 bg-black"
            style={{ color: "var(--text-muted)", borderColor: "var(--glass-border)" }}
          >
            <p className="flex justify-center items-center gap-4">
              <span className="flex gap-1">
                <i className="fa-solid fa-arrow-up border border-slate-700 p-1 rounded" />
                <i className="fa-solid fa-arrow-down border border-slate-700 p-1 rounded" />
              </span>
              to move
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeView({ onSwitchTab, onLaunchGame }: { onSwitchTab: (tab: Tab) => void; onLaunchGame: (id: string) => void }) {
  return (
    <section className="p-6 lg:p-12 max-w-[1600px] mx-auto space-y-12 animate-fade-in relative z-10">
      <div className="relative w-full rounded-[32px] overflow-hidden h-[60vh] min-h-[500px] shadow-2xl group isolate"
        style={{ boxShadow: "0 25px 50px -12px rgba(99,102,241,0.1)" }}
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[3s] group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-base)] via-[var(--color-base)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-base)] via-[var(--color-base)]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-4xl">
          <div className="flex items-center gap-3 mb-6 animate-slide-up">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md">
              <i className="fa-solid fa-sparkles text-yellow-400 mr-2" /> SEASON 5 LIVE
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md"
              style={{ background: "rgba(99,102,241,0.2)", color: "var(--color-primary)", borderColor: "rgba(99,102,241,0.3)" }}
            >
              BETA v2.0
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight animate-slide-up">
            Retrofuturism <br />
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-500 bg-[length:200%_auto] animate-shimmer">Reimagined</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed animate-slide-up">
            Dive into a curated universe of physics-based chaos, neon-soaked puzzles, and competitive arcade classics. The CheeseMan library is expanding.
          </p>
          <div className="flex flex-wrap gap-4 animate-slide-up">
            <button onClick={() => onSwitchTab("games")}
              className="px-8 py-4 bg-white text-black font-extrabold rounded-2xl hover:bg-[var(--color-primary)] hover:text-white transition-all transform hover:-translate-y-1 flex items-center gap-3"
              style={{ boxShadow: "0 10px 15px -3px rgba(99,102,241,0.3)" }}
            >
              <i className="fa-solid fa-play" /> Start Playing
            </button>
            <button onClick={() => onLaunchGame("cubecombat")}
              className="px-8 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 group/btn"
            >
              <span>Featured Game</span>
              <i className="fa-solid fa-arrow-right group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: "fa-trophy", value: "12", label: "Achievements", gradient: "from-indigo-500 to-blue-600", shadowColor: "rgba(99,102,241,0.2)", borderHover: "var(--color-primary)" },
          { icon: "fa-clock", value: "84h", label: "Time Played", gradient: "from-emerald-400 to-green-600", shadowColor: "rgba(16,185,129,0.2)", borderHover: "#10b981" },
          { icon: "fa-fire", value: "15", label: "Day Streak", gradient: "from-pink-500 to-rose-600", shadowColor: "rgba(236,72,153,0.2)", borderHover: "var(--color-accent)" },
          { icon: "fa-users", value: "204", label: "Global Online", gradient: "from-amber-400 to-orange-600", shadowColor: "rgba(245,158,11,0.2)", borderHover: "#f59e0b" },
        ].map((stat, i) => (
          <div key={i}
            className="glass p-6 rounded-3xl border relative overflow-hidden group transition-all"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-colors"
              style={{ background: `${stat.shadowColor}` }}
            />
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                style={{ boxShadow: `0 10px 15px -3px ${stat.shadowColor}` }}
              >
                <i className={`fa-solid ${stat.icon}`} />
              </div>
              <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-white/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Trending Now</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Most played by the community this week.</p>
          </div>
          <button onClick={() => onSwitchTab("games")}
            className="px-4 py-2 rounded-lg hover:bg-white/5 font-bold text-sm transition-colors flex items-center gap-2"
            style={{ color: "var(--color-primary)" }}
          >
            View Library <i className="fa-solid fa-arrow-right" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div onClick={() => onLaunchGame("cubecombat")}
            className="group cursor-pointer relative rounded-3xl overflow-hidden aspect-[16/9] border transition-all hover:shadow-2xl"
            style={{ borderColor: "rgba(255,255,255,0.05)", boxShadow: "0 10px 15px -3px rgba(99,102,241,0.1)" }}
          >
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
              <i className="fa-solid fa-gamepad text-8xl text-indigo-500/50" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-black text-2xl text-white group-hover:text-[var(--color-primary)] transition-colors">Cube Combat</h3>
                <span className="inline-block px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded">HOT</span>
              </div>
              <div className="flex-1 flex items-center justify-center bg-red-600/90 backdrop-blur-sm rounded-2xl border-2 border-red-400">
                <div className="text-center">
                  <i className="fa-solid fa-triangle-exclamation text-6xl text-white mb-4" />
                  <h4 className="text-5xl font-black text-white tracking-wider">BROKEN</h4>
                  <p className="text-white/80 text-sm mt-2">Game temporarily unavailable</p>
                </div>
              </div>
            </div>
          </div>

          <div onClick={() => onLaunchGame("sketchycasino")}
            className="group cursor-pointer relative rounded-3xl overflow-hidden aspect-[16/9] border transition-all hover:shadow-2xl"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-red-950 to-black flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
              <i className="fa-solid fa-dice text-8xl text-red-400 group-hover:scale-125 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <span className="inline-block px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded mb-2 w-fit">NEW</span>
              <h3 className="font-black text-2xl text-white mb-1 group-hover:text-red-400 transition-colors">Sketchy Casino</h3>
              <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                Try your luck at the tables in this shady casino experience.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                <span className="bg-white/10 px-2 py-1 rounded"><i className="fa-solid fa-dice mr-1" /> Casino</span>
                <span className="bg-white/10 px-2 py-1 rounded"><i className="fa-solid fa-coins mr-1" /> Gambling</span>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 border border-white/20">
              <i className="fa-solid fa-play text-white text-2xl pl-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GamesView({ onLaunchGame }: { onLaunchGame: (id: string) => void }) {
  return (
    <section className="p-6 lg:p-12 max-w-[1600px] mx-auto min-h-full animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-2">Game Library</h1>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>Browse your collection of installed games.</p>
        </div>
        <div className="relative group">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "var(--text-muted)" }}
          />
          <input type="text" placeholder="Search library..."
            className="pl-12 pr-4 py-4 rounded-2xl text-white focus:outline-none transition-all shadow-lg"
            style={{ background: "rgba(39,39,42,0.3)", border: "1px solid rgba(255,255,255,0.05)", width: "100%", minWidth: "200px" }}
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {["All Games", "Arcade", "Puzzle", "Card"].map((cat) => (
          <button key={cat}
            className={`px-6 py-2.5 font-bold rounded-xl text-sm whitespace-nowrap transition-all ${cat === "All Games" ? "bg-white text-black" : "hover:bg-white/10 hover:text-white"}`}
            style={cat !== "All Games" ? { background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.05)" } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {GAMES.map((game) => (
          <button key={game.id} onClick={() => onLaunchGame(game.id)}
            className="group relative flex flex-col items-start p-1 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="w-full aspect-video rounded-[20px] overflow-hidden relative mb-4">
              <div className="w-full h-full bg-slate-800 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                {game.icon ? (
                  <i className={`fa-solid ${game.icon} text-6xl transition-transform duration-300`}
                    style={{ color: `var(--color-${game.tagColor === "red" ? "accent" : game.tagColor === "emerald" ? "primary" : game.tagColor})` }}
                  />
                ) : (
                  <img src={`/src/assets/${game.id}.png`} alt={game.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-10">
                <h3 className="text-lg font-bold text-white">{game.name}</h3>
                {game.tags.map((tag) => (
                  <span key={tag} className={`px-2 py-0.5 bg-${game.tagColor}-500 text-white text-[9px] font-bold rounded`}>{tag}</span>
                ))}
              </div>
              {game.broken && (
                <div className="absolute top-12 left-3 right-3 bottom-3 flex items-center justify-center bg-red-600/90 backdrop-blur-sm rounded-xl border-2 border-red-400">
                  <div className="text-center">
                    <i className="fa-solid fa-triangle-exclamation text-3xl text-white mb-2" />
                    <h4 className="text-2xl font-black text-white tracking-wider">BROKEN</h4>
                    <p className="text-white/80 text-xs mt-1">Temporarily unavailable</p>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full px-4 pb-4 flex justify-between items-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{game.desc}</p>
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all ml-2 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <i className="fa-solid fa-play text-xs" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function CommunityView() {
  return (
    <section className="p-6 lg:p-12 max-w-[1600px] mx-auto min-h-full animate-fade-in">
      <h1 className="text-4xl lg:text-5xl font-black text-white mb-8">Community Hub</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-4 rounded-2xl flex justify-between items-center"
            style={{ borderColor: "rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ background: "var(--color-primary)" }}
              >
                <i className="fa-solid fa-user" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold">PlayerOne</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Online</span>
              </div>
            </div>
          </div>

          <div className="text-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4" style={{ color: "var(--color-primary)" }} />
            <p style={{ color: "var(--text-muted)" }}>Loading community updates...</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-calendar-star" style={{ color: "var(--color-primary)" }} /> Live Events
            </h3>
            <div className="p-4 rounded-2xl transition-all cursor-pointer group"
              style={{ background: "linear-gradient(to right, rgba(99,102,241,0.2), rgba(236,72,153,0.1))", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-bold text-white uppercase backdrop-blur-sm">Ending Soon</span>
                <i className="fa-solid fa-chevron-right text-xs text-white/50 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-bold text-white text-lg leading-tight mb-1">Weekend Tournament</h4>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Double XP in all multiplayer modes.</p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4" style={{ background: "var(--color-primary)" }} />
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-ranking-star text-yellow-400" /> Top Players
            </h3>
            {[
              { rank: 1, name: "ProGamer99", score: "999k", color: "text-yellow-400", seed: "Pro" },
              { rank: 2, name: "EliteSniper", score: "842k", color: "text-slate-300", seed: "Elite" },
              { rank: 3, name: "CasualBob", score: "721k", color: "text-orange-400", seed: "Noob" },
            ].map((player) => (
              <div key={player.rank} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                <span className={`font-black w-4 ${player.color}`}>{player.rank}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                  style={{ background: `${player.color === "text-yellow-400" ? "rgba(250,204,21,0.2)" : player.color === "text-slate-300" ? "rgba(203,213,225,0.2)" : "rgba(251,146,60,0.2)"}` }}
                >
                  <i className="fa-solid fa-user" />
                </div>
                <span className="font-bold text-white text-sm flex-1">{player.name}</span>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SettingsView({
  theme, onSetTheme, reducedMotion, showFps, onToggleReducedMotion, onToggleShowFps,
}: {
  theme: string; onSetTheme: (t: string) => void;
  reducedMotion: boolean; showFps: boolean;
  onToggleReducedMotion: () => void; onToggleShowFps: () => void;
}) {
  return (
    <section className="p-6 lg:p-12 max-w-4xl mx-auto min-h-full animate-fade-in">
      <h1 className="text-4xl lg:text-5xl font-black text-white mb-8">Settings</h1>

      <div className="space-y-8">
        <div className="glass rounded-3xl p-8 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-lg border"
              style={{ background: "rgba(99,102,241,0.2)", color: "var(--color-primary)", borderColor: "rgba(99,102,241,0.2)" }}
            ><i className="fa-solid fa-user-gear" /></span>
            Account
          </h2>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: "var(--color-primary)" }}
            >
              <i className="fa-solid fa-user" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Guest</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Not signed in</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-bold uppercase tracking-wide mb-2 block"
              style={{ color: "var(--text-muted)" }}
            >Display Name</label>
            <div className="flex gap-2">
              <input type="text" placeholder="Enter username"
                className="flex-1 rounded-xl px-4 py-2 text-white focus:outline-none transition-colors"
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{ color: "var(--text-muted)" }}
            >Sign In with Magic Link</h3>
            <input type="email" placeholder="you@example.com"
              className="w-full rounded-xl px-4 py-3 text-white focus:outline-none transition-colors mb-3"
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <button className="px-6 py-3 text-white font-bold rounded-xl transition-colors"
              style={{ background: "var(--color-primary)" }}
            >
              <i className="fa-solid fa-wand-magic-sparkles mr-2" /> Send Magic Link
            </button>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-lg border"
              style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa", borderColor: "rgba(59,130,246,0.2)" }}
            ><i className="fa-solid fa-display" /></span>
            Display & Appearance
          </h2>

          <div className="space-y-8">
            <div>
              <span className="block text-white font-bold mb-4 flex items-center gap-2">
                <i className="fa-solid fa-palette text-xs" style={{ color: "var(--text-muted)" }} /> Color Theme
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {THEMES.map((t) => (
                  <button key={t} onClick={() => onSetTheme(t)}
                    className="p-1 rounded-2xl transition-all text-left group relative overflow-hidden"
                    style={{
                      border: `2px solid ${theme === t ? "var(--color-primary)" : "transparent"}`,
                      background: "rgba(39,39,42,0.1)",
                    }}
                  >
                    <div className="w-full aspect-[4/3] rounded-xl mb-2 relative overflow-hidden"
                      style={{
                        background: t === "default" ? "#09090b" : t === "light" ? "#f4f4f5" : t === "midnight" ? "#020617" : t === "forest" ? "#052e16" : t === "sunset" ? "#2a1b3d" : t === "neon" ? "#000" : t === "ocean" ? "#0f1c2e" : "#fce4ec",
                        border: t === "light" ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="absolute inset-0 opacity-20"
                        style={{
                          background: t === "default" ? "linear-gradient(to bottom right, #6366f1, #ec4899)" : t === "light" ? "none" : t === "midnight" ? "linear-gradient(to bottom right, #0ea5e9, #312e81)" : t === "forest" ? "linear-gradient(to bottom right, #059669, #047857)" : t === "sunset" ? "linear-gradient(to bottom right, #e11d48, #7e22ce)" : t === "neon" ? "none" : t === "ocean" ? "none" : "linear-gradient(to bottom right, #f06292, #ba68c8)",
                        }}
                      />
                      <div className="absolute top-2 left-2 w-4 h-4 rounded-full"
                        style={{
                          background: t === "default" ? "#6366f1" : t === "light" ? "#4f46e5" : t === "midnight" ? "#38bdf8" : t === "forest" ? "#4ade80" : t === "sunset" ? "#d83f87" : t === "neon" ? "#0ff0fc" : t === "ocean" ? "#4d9de0" : "#f06292",
                        }}
                      />
                    </div>
                    <span className="block text-center text-xs font-bold mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >{t === "boykisser67" ? "Boykisser 67" : t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between group p-4 rounded-xl transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div>
                <span className="block text-white font-bold flex items-center gap-2">
                  <i className="fa-solid fa-person-walking-dashed-line-arrow-right" style={{ color: "var(--text-muted)" }} />
                  Reduced Motion
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Disable parallax and heavy animations</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={reducedMotion} onChange={onToggleReducedMotion} />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{ background: reducedMotion ? "var(--color-primary)" : "rgb(51,65,85)" }}
                />
              </label>
            </div>

            <div className="flex items-center justify-between group p-4 rounded-xl transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div>
                <span className="block text-white font-bold flex items-center gap-2">
                  <i className="fa-solid fa-gauge-high" style={{ color: "var(--text-muted)" }} /> Show FPS
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Display performance metrics</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={showFps} onChange={onToggleShowFps} />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{ background: showFps ? "var(--color-primary)" : "rgb(51,65,85)" }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-lg border"
              style={{ background: "rgba(236,72,153,0.2)", color: "#f472b6", borderColor: "rgba(236,72,153,0.2)" }}
            ><i className="fa-solid fa-volume-high" /></span>
            Audio
          </h2>
          <div>
            <div className="flex justify-between mb-4">
              <span className="text-white font-bold">Master Volume</span>
              <span className="font-mono font-bold" style={{ color: "var(--color-primary)" }}>80%</span>
            </div>
            <input type="range" defaultValue={80}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ background: "rgb(51,65,85)", accentColor: "var(--color-primary)" }}
            />
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-lg border"
              style={{ background: "rgba(16,185,129,0.2)", color: "#34d399", borderColor: "rgba(16,185,129,0.2)" }}
            ><i className="fa-solid fa-code-branch" /></span>
            Developer Options
          </h2>
          <div className="flex items-center justify-between group p-4 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div>
              <span className="block text-white font-bold mb-1">Test Branch</span>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Switch to the experimental build to test new features.</p>
            </div>
            <a href="games/testbranch.html"
              className="px-4 py-2 font-bold rounded-lg transition-colors border"
              style={{ background: "rgba(16,185,129,0.2)", color: "#34d399", borderColor: "rgba(16,185,129,0.3)" }}
            >
              Switch Branch <i className="fa-solid fa-arrow-right ml-2 text-xs" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CreditsView() {
  return (
    <section className="p-6 lg:p-12 max-w-4xl mx-auto min-h-full animate-fade-in">
      <h1 className="text-4xl lg:text-5xl font-black text-white mb-8 text-center">Credits</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-6 border"
            style={{ background: "rgba(99,102,241,0.2)", color: "var(--color-primary)", borderColor: "rgba(99,102,241,0.3)" }}
          >
            <i className="fa-solid fa-code" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Development</h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>Built with passion and caffeine.</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><span className="text-white font-bold">Fkm_X3</span> - Dev</li>
            <li><span className="text-white font-bold">BobbyThe124</span> - Artist and Dev (sometimes)</li>
          </ul>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-6 border"
            style={{ background: "rgba(236,72,153,0.2)", color: "#f472b6", borderColor: "rgba(236,72,153,0.3)" }}
          >
            <i className="fa-solid fa-layer-group" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Technology</h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>Powered by open source magic.</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Tailwind CSS</li>
            <li>Font Awesome 6</li>
            <li>Google Fonts (Outfit)</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>&copy; 2025 CheeseMan Games. All rights reserved.</p>
        <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>v2.5.0-beta</p>
      </div>
    </section>
  );
}

function SocialsView() {
  return (
    <section className="p-6 lg:p-12 max-w-[1600px] mx-auto min-h-full animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-16 mt-8">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border"
          style={{ background: "rgba(99,102,241,0.1)", color: "var(--color-primary)", borderColor: "rgba(99,102,241,0.2)" }}
        >Connect With Us</span>
        <h1 className="text-4xl lg:text-6xl font-black text-white mb-6">
          Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">Revolution</span>
        </h1>
        <p className="text-xl" style={{ color: "var(--text-muted)" }}>Be part of our growing community. Get exclusive updates, find teammates, and share your achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: "Discord", icon: "fa-discord", color: "#5865F2", desc: "Join 5+ members in our official server." },
          { name: "Twitter", icon: "fa-x-twitter", color: "#000", desc: "Follow for latest updates and sneak peeks." },
          { name: "YouTube", icon: "fa-youtube", color: "#FF0000", desc: "Devlogs, trailers, and community highlights." },
          { name: "GitHub", icon: "fa-github", color: "#333", desc: "Contribute to the open source codebase." },
        ].map((social) => (
          <a key={social.name} href="#"
            className="group glass p-8 rounded-[32px] border border-white/5 transition-all duration-300 hover:-translate-y-2 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-6 text-4xl shadow-xl transition-colors group-hover:bg-white"
              style={{ color: "white" }}
            >
              <i className={`fa-brands ${social.icon}`} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">{social.name}</h3>
            <p className="text-sm text-slate-300 group-hover:text-white/80 mb-6 font-medium">{social.desc}</p>
            <span className="inline-flex items-center justify-center w-full py-3 bg-white/10 rounded-xl text-white font-bold text-sm transition-colors group-hover:bg-white">
              {social.name === "GitHub" ? "Star Repo" : social.name === "Discord" ? "Join Server" : social.name === "YouTube" ? "Subscribe" : "Follow Us"}
              <i className="fa-solid fa-arrow-right ml-2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-5px] group-hover:translate-x-0" />
            </span>
          </a>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 mt-12" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 className="text-xl font-semibold mb-2">Special Thanks</h2>
        <p className="text-sm" style={{ color: "var(--text-main)" }}>
          Thanks to @RedFox-AI51 for providing the framework for testbranch.
          Thanks to everyone who helped test CheeseMan Games and provided feedback.
        </p>
      </div>
    </section>
  );
}

export default App;
