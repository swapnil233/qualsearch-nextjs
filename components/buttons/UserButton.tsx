import {
  Avatar,
  Group,
  Menu,
  Skeleton,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowsUpDown,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  user: {
    display: "block",
    width: "100%",
    padding: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.gray[2],
    },
  },
}));

interface UserButtonProps extends UnstyledButtonProps {
  image: string | undefined | null;
  name?: string | undefined | null;
  email?: string | undefined | null;
  icon?: React.ReactNode;
}

export function UserButton({
  image,
  name,
  email,
  icon,
  ...others
}: UserButtonProps) {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  return (
    <Menu shadow="md" width={200} position="right-end">
      <Menu.Target>
        <UnstyledButton className={classes.user} {...others}>
          <Group>
            {image !== undefined && image !== null ? (
              <Avatar src={image} radius="xl" />
            ) : (
              <Skeleton height={40} circle />
            )}

            <div style={{ flex: 1 }}>
              {name !== undefined ? (
                <Text size="sm" weight={500}>
                  {name}
                </Text>
              ) : (
                <Skeleton
                  width={120}
                  height={8}
                  animate
                  radius={"xs"}
                  mb={"xs"}
                />
              )}

              {email !== undefined ? (
                <Text color="dimmed" size="xs">
                  {email}
                </Text>
              ) : (
                <Skeleton width={80} height={8} animate radius={"xs"} />
              )}
            </div>

            {icon || <IconArrowsUpDown size="0.9rem" stroke={1.5} />}
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Link href="/profile/" className="no-underline">
          <Menu.Item
            icon={<IconUser size="1.1rem" />}
            color={theme.colorScheme === "dark" ? theme.white : theme.black}
          >
            My profile
          </Menu.Item>
        </Link>
        <Link href="/profile/settings" className="no-underline">
          <Menu.Item
            icon={<IconSettings size="1.1rem" />}
            color={theme.colorScheme === "dark" ? theme.white : theme.black}
          >
            Account settings
          </Menu.Item>
        </Link>
        <Menu.Divider />
        <Menu.Item
          onClick={() => {
            signOut({ callbackUrl: "/" });
          }}
          icon={<IconLogout size="1.1rem" />}
          color={theme.colorScheme === "dark" ? theme.white : theme.black}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
