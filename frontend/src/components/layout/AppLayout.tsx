import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "../ui/sidebar";

const NAV_ITEMS = [
    { to: "/parlamentares", label: "Parlamentares", icon: "leaderboard" },
    { to: "/partidos", label: "Gastos por Partido", icon: "pie_chart" },
];

function isNavItemActive(pathname: string, to: string) {
    if (to === "/parlamentares") return pathname === "/" || pathname === "/ranking" || pathname === "/parlamentares" || pathname.startsWith("/parlamentares/");
    return pathname === to;
}

export default function AppLayout() {
    const { pathname } = useLocation();

    return (
        <SidebarProvider className="bg-background text-on-surface font-body">
            <Sidebar className="border-r border-white/12 bg-linear-to-b from-[#060F24] via-[#0B1F46] to-[#143A78] shadow-2xl shadow-[#050A16]/45">
                <SidebarHeader>
                    <Link to="/parlamentares" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/8">
                        <img src="/flag_brasil.svg" alt="Bandeira do Brasil" className="h-16 w-16" />
                        <span>
                            <span className="block text-base font-headline font-extrabold text-white">Monitor</span>
                            <span className="block text-[10px] font-semibold tracking-[0.22em] uppercase text-blue-100/90">Parlamentar</span>
                        </span>
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            {NAV_ITEMS.map((item) => (
                                <SidebarMenuItem key={item.to}>
                                    <SidebarMenuButton asChild isActive={isNavItemActive(pathname, item.to)}>
                                        <NavLink to={item.to}>
                                            {/* Se estiver selecionado o ícone é preto, senão é branco */}
                                            <span className={"material-symbols-outlined text-[20px] " + (isNavItemActive(pathname, item.to) ? "text-black" : "text-white")}>
                                                {item.icon}
                                            </span>
                                            {/* Se estiver selecionado a cor é preta, senão é branca, aplicar abaixo */}
                                            <span className={isNavItemActive(pathname, item.to) ? "text-black" : "text-white"}>{item.label}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
            </Sidebar>

            {/* <header className="glass-header fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 px-4 shadow-xl shadow-slate-900/10 md:left-64 md:px-8">
                <div className="min-w-0 pr-4">
                    <h1 className="truncate font-headline text-lg font-semibold text-white">{pageTitle}</h1>
                </div>

                <div className="hidden w-full max-w-sm items-center justify-end sm:flex">
                    <label className="flex w-full items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white/80">
                        <span className="material-symbols-outlined text-[18px]">search</span>
                        <input
                            type="text"
                            value=""
                            readOnly
                            placeholder="Buscar parlamentar, partido, UF..."
                            className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                        />
                    </label>
                </div>
            </header> */}

            <SidebarInset>
                <div className="px-4 pt-4 md:hidden">
                    <SidebarTrigger />
                </div>
                <main>
                    <div className="px-4 py-8 md:px-8 md:py-8">
                        <Outlet />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
