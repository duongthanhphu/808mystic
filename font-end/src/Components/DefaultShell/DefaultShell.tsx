import { AppShell, Burger, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet  } from 'react-router-dom';
import { AdminHeader } from "./AdminHeader.tsx";
import DefaultNavbar from '../DefaulNavbar/DefaultNavbar.tsx'
export default function DefaultShell() {
    const [opened, { toggle }] = useDisclosure();

    return (
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header >
          <Group h="100%" px="md" style={{ flexWrap: "nowrap" }}>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group w="100%" position="apart" style={{ flexWrap: "nowrap" }}>
              <AdminHeader />
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar
          p="md"
        //   className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400"
        >
          <DefaultNavbar />
        </AppShell.Navbar>
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    );
}

