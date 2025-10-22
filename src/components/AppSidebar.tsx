import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Home, History, BarChart3, Shield, Rocket } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  { title: 'Home', url: '/', icon: Home, enabled: true },
  { title: 'Histórico', url: '/history', icon: History, enabled: false },
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3, enabled: false },
  { title: 'Admin', url: '/admin', icon: Shield, enabled: false },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Takeoff_AI</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const menuButton = (
                  <SidebarMenuButton asChild disabled={!item.enabled}>
                    {item.enabled ? (
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive ? 'bg-primary/10 text-primary font-medium' : ''
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    ) : (
                      <div className="opacity-50 cursor-not-allowed">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    {!item.enabled ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                        <TooltipContent side="right">Em breve</TooltipContent>
                      </Tooltip>
                    ) : (
                      menuButton
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Badge variant="outline" className="justify-center">
          DEV
        </Badge>
      </SidebarFooter>
    </Sidebar>
  );
}
