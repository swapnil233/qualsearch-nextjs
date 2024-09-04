import { ActionIcon, Indicator, Menu } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";

export interface INotificationsButtonProps {
  newNotifications: boolean;
}

const NotificationsButton: React.FC<INotificationsButtonProps> = ({
  newNotifications,
}) => {
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
            <IconBell stroke={1.4} color="black" />
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
