import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ComponentPropsWithoutRef,
    type HTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

type SidebarContextValue = {
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    toggleMobile: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider.");
    }
    return context;
}

function SidebarProvider({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    const [openMobile, setOpenMobile] = useState(false);

    const value = useMemo(
        () => ({
            openMobile,
            setOpenMobile,
            toggleMobile: () => setOpenMobile((prev) => !prev),
        }),
        [openMobile],
    );

    return (
        <SidebarContext.Provider value={value}>
            <div
                data-slot="sidebar-wrapper"
                className={cn("min-h-svh w-full", className)}
                {...props}
            >
                {children}
            </div>
        </SidebarContext.Provider>
    );
}

function Sidebar({ className, children, ...props }: ComponentPropsWithoutRef<"aside">) {
    const { openMobile, setOpenMobile } = useSidebar();

    return (
        <>
            <div
                className={cn(
                    "fixed inset-0 z-30 bg-black/35 transition-opacity md:hidden",
                    openMobile ? "opacity-100" : "pointer-events-none opacity-0",
                )}
                onClick={() => setOpenMobile(false)}
            />

            <aside
                data-slot="sidebar"
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform md:translate-x-0",
                    openMobile ? "translate-x-0" : "-translate-x-full",
                    className,
                )}
                {...props}
            >
                {children}
            </aside>
        </>
    );
}

function SidebarTrigger({ className, ...props }: ComponentPropsWithoutRef<"button">) {
    const { toggleMobile } = useSidebar();

    return (
        <button
            type="button"
            data-slot="sidebar-trigger"
            className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-white text-on-surface shadow-sm transition-colors hover:bg-surface-container-low md:hidden",
                className,
            )}
            onClick={toggleMobile}
            {...props}
        >
            <PanelLeft className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
        </button>
    );
}

function SidebarInset({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="sidebar-inset" className={cn("md:ml-64", className)} {...props} />;
}

function SidebarHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="sidebar-header" className={cn("px-6 pb-4 pt-6", className)} {...props} />;
}

function SidebarContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="sidebar-content" className={cn("flex-1 overflow-y-auto px-3 pb-6 pt-2", className)} {...props} />;
}

function SidebarGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="sidebar-group" className={cn("space-y-1.5", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: ComponentPropsWithoutRef<"ul">) {
    return <ul data-slot="sidebar-menu" className={cn("space-y-1.5", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: ComponentPropsWithoutRef<"li">) {
    return <li data-slot="sidebar-menu-item" className={cn("list-none", className)} {...props} />;
}

type SidebarMenuButtonProps = ComponentPropsWithoutRef<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
};

function SidebarMenuButton({ className, asChild = false, isActive = false, ...props }: SidebarMenuButtonProps) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="sidebar-menu-button"
            className={cn(
                "group relative flex w-full items-center gap-3 rounded-r-lg px-4 py-3 text-sm transition-all duration-200",
                isActive
                    ? "bg-white pl-3 font-semibold text-emerald-700 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-r before:bg-amber-400"
                    : "text-blue-50/95 hover:translate-x-1 hover:bg-white/15 hover:text-white",
                className,
            )}
            {...props}
        />
    );
}

function SidebarFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="sidebar-footer" className={cn("px-3 pb-4 pt-2", className)} {...props} />;
}

function SidebarRail({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="sidebar-rail" className={cn("absolute right-0 top-0 h-full w-px bg-white/10", className)} {...props} />;
}

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger
};

