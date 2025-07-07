import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, Collapsible, CollapsibleContent, CollapsibleTrigger, Separator, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { ChevronRight, InfoIcon } from 'lucide-react';
import { ComponentProps, ComponentType, ReactNode } from 'react';


// TODO: 작업
/** 사이드 메뉴 */
type Group = {
  label: string
  items: Menu[]
};

type Menu = {
  title: string
  href: string
  icon: ComponentType
  children?: Menu[]
};

type SidebarProps = {
  header: ReactNode
  groups: Group[]
};
function AppSideBar({ header, groups }: SidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>{header}</SidebarHeader>
      <SidebarContent>
        {groups.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupAction />
            <SidebarGroupContent>
              {group.items.map((item, index) => (
                <SidebarMenu key={index}>
                  <Collapsible defaultOpen className="tw:group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} asChild>
                          <a href={item.href}>
                            <item.icon />
                            {item.title}
                            <ChevronRight className="tw:ml-auto tw:transition-transform tw:group-data-[state=open]/collapsible:rotate-90" />
                          </a>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children?.map((child, index) => (
                            <SidebarMenuSubItem key={index}>
                              <SidebarMenuSubButton asChild>
                                <a href={child.href}>
                                  <child.icon />
                                  <span>{child.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}

// TODO: 작업
/** 사이드 메뉴 - Breadcrumb */
function AppBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>Home 01</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Menu 01</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Page 01</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function SidebarLayout({ children, className, ...props }: ComponentProps<'section'>) {
  return (
    <SidebarProvider className="tw:size-full">
      <AppSideBar
        header="헤더"
        groups={[
          {
            label: '1번 그룹',
            items: [{
              title: '1번 아이템',
              href: '#',
              icon: InfoIcon,
              children: [
                {
                  title: '1번 서브 아이템',
                  href: '#',
                  icon: InfoIcon,
                },
                {
                  title: '2번 서브 아이템',
                  href: '#',
                  icon: InfoIcon,
                },
              ],
            }],
          },
          {
            label: '2번 라벨',
            items: [{
              title: '1번 아이템',
              href: '#',
              icon: InfoIcon,
            }],
          },
        ]}
      />
      <SidebarInset className="tw:size-full tw:grid tw:grid-rows-[auto_auto_1fr]">
        <header className="tw:flex tw:items-center tw:gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" />
          <AppBreadcrumb />
        </header>
        <Separator orientation="horizontal" />
        <section {...props} className={cn('tw:scroll tw:p-2', className)}>
          {children}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
