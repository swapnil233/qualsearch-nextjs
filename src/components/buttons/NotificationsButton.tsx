import {
  ActionIcon,
  Indicator,
  Menu,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";

export interface INotificationsButtonProps {
  newNotifications: boolean;
}

const NotificationsButton: React.FC<INotificationsButtonProps> = ({
  newNotifications,
}) => {
  const { colors } = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  return (
    <Menu>
      <Menu.Target>
        <Indicator size={newNotifications ? 10 : 0} offset={11}>
          <ActionIcon
            variant="subtle"
            radius="xl"
            aria-label="Notifications"
            size="lg"
          >
            <IconBell
              stroke={1.4}
              color={colorScheme === "dark" ? colors.dark[0] : colors.gray[7]}
            />
          </ActionIcon>
        </Indicator>
      </Menu.Target>
      {newNotifications && (
        <Menu.Dropdown>
          <p>Notifications</p>
        </Menu.Dropdown>
      )}
    </Menu>
  );
};

export default NotificationsButton;
