import { Avatar, Menu, MenuDivider, rem, Stack, Text } from "@mantine/core";
import {
  IconGift,
  IconLogout,
  IconReport,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";
import UserButton from "../buttons/UserButton";

interface IUserNavMenu {
  image: string;
  name: string;
  email: string;
}

const UserNavMenu: FC<IUserNavMenu> = ({ image, name, email }) => {
  return (
    <Menu>
      <Menu.Target>
        <UserButton image={image} />
      </Menu.Target>

      <Menu.Dropdown
        p={0}
        maw="calc(100vw - 10px)"
        w={300}
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.1) 0px 1px 3px, rgba(0, 0, 0, 0.06) 0px 4px 8px",
          border: "1px solid rgb(194, 197, 205)",
          boxSizing: "border-box",
        }}
      >
        <Stack
          py="md"
          px="xl"
          bg="#f6f8fc"
          style={{
            borderBottom: "1px solid var(--mantine-colors-gray-3)",
          }}
          justify="center"
          align="center"
        >
          <Avatar
            src={image}
            alt="User avatar"
            w={60}
            h={60}
            className="rounded-full"
          />
          <Stack gap="2">
            <Text ta="center" fw="bold">
              {name}
            </Text>
            <Text ta="center" size="xs" c="dimmed">
              {email}
            </Text>
          </Stack>
        </Stack>
        <Stack py="sm" gap={"xs"}>
          <Menu.Item
            leftSection={
              <IconUser style={{ width: rem(16), height: rem(16) }} />
            }
            component={Link}
            href={"/account"}
          >
            Account
          </Menu.Item>
          <Menu.Item
            leftSection={
              <IconUsersGroup style={{ width: rem(16), height: rem(16) }} />
            }
            component={Link}
            href={"/teams"}
          >
            Teams
          </Menu.Item>
          <Menu.Item
            leftSection={
              <IconReport style={{ width: rem(16), height: rem(16) }} />
            }
            component={Link}
            href={"/account/billing"}
          >
            Billing
          </Menu.Item>
        </Stack>
        <MenuDivider m={0} p={0} />
        <Stack py="sm" gap={"xs"}>
          <Menu.Item
            leftSection={
              <IconGift style={{ width: rem(16), height: rem(16) }} />
            }
            component={Link}
            href={"/account/referrals"}
          >
            Refer and earn
          </Menu.Item>
        </Stack>
        <MenuDivider m={0} p={0} />
        <Stack py="sm" m={0} gap={"xs"}>
          <Menu.Item
            onClick={() =>
              signOut({
                redirect: true,
                callbackUrl: "/",
              })
            }
            color="red"
            leftSection={
              <IconLogout style={{ width: rem(16), height: rem(16) }} />
            }
          >
            Sign out
          </Menu.Item>
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserNavMenu;
