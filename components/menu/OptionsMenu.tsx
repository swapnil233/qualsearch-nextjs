import { ActionIcon, Menu } from "@mantine/core";
import { IconDots, TablerIconsProps } from "@tabler/icons-react";
import { ReactElement } from "react";

type Option = {
  option: string;
  icon: ReactElement<TablerIconsProps>;
  color?: string;
  onClick: () => void;
};

interface IOptionsMenuProps {
  options: Option[];
}

const OptionsMenu: React.FC<IOptionsMenuProps> = ({ options }) => {
  return (
    <Menu shadow="md" width={200} withinPortal>
      <Menu.Target>
        <ActionIcon variant="transparent">
          <IconDots size={"1rem"} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {options.map((option, index) => (
          <Menu.Item
            color={option.color}
            key={index}
            onClick={option.onClick}
            leftSection={option.icon}
          >
            {option.option}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default OptionsMenu;
