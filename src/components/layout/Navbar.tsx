import { NavLink } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, Satellite, Route, Bell, Settings, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/objects", label: "Objects", icon: Satellite },
  { to: "/conjunctions", label: "Conjunctions", icon: Route },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

const linkBase = "px-3 py-2 rounded-md transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  
  // Get user's display name or email
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.display_name || 
           user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           'User';
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    }
  };
  const LinkItem = ({ to, label, Icon }: { to: string; label: string; Icon: React.ComponentType<{ className?: string }> }) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `${linkBase} ${isActive ? "bg-secondary text-primary" : "text-foreground/80"}`
      }
      onClick={() => setOpen(false)}
    >
      <Icon className="mr-2 h-4 w-4" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Satellite className="h-6 w-6 text-primary" />
          <span className="font-heading text-2xl tracking-wide">Orbital Guardian</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden gap-1 md:flex">
          {navItems.map((item) => (
            <LinkItem key={item.to} to={item.to} label={item.label} Icon={item.icon} />
          ))}
        </nav>
        <div className="hidden md:flex md:items-center md:gap-4">
          {!loading && user && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{getGreeting()},</span>
              <span className="font-medium text-foreground">{getUserDisplayName()}</span>
            </div>
          )}
          {!loading && (user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>Logout</Button>
          ) : (
            <NavLink to="/auth" className={`${linkBase} text-foreground/80`}>Login</NavLink>
          ))}
        </div>
        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger aria-label="Open Menu" className="p-2 rounded-md hover:bg-muted">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-8 flex flex-col gap-2">
                {navItems.map((item) => (
                  <LinkItem key={item.to} to={item.to} label={item.label} Icon={item.icon} />
                ))}
                <div className="mt-4">
                  {!loading && user && (
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">{getGreeting()},</p>
                      <p className="font-medium">{getUserDisplayName()}</p>
                    </div>
                  )}
                  {!loading && (user ? (
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>Logout</Button>
                  ) : (
                    <NavLink to="/auth" className={`${linkBase} block`}>Login</NavLink>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
