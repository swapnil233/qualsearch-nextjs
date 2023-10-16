import convertToTimestamp from "@/utils/convertToTimestamp";
import { Button, useMantineTheme } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { FC, useMemo } from "react";

interface IPlayTranscriptBlockButton {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  startingTimestamp: number;
}

const PlayTranscriptBlockButton: FC<IPlayTranscriptBlockButton> = ({
  audioRef,
  startingTimestamp,
}) => {
  const theme = useMantineTheme();

  const formattedTimestamp = useMemo(() => {
    return convertToTimestamp(startingTimestamp);
  }, [startingTimestamp]);

  const handleTimestampClick = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = startingTimestamp;
      audioRef.current.play();
    }
  };

  return (
    <Button
      variant="outline"
      color={theme.colorScheme === "dark" ? "gray" : "dark"}
      compact
      leftIcon={<IconPlayerPlay size={"1rem"} />}
      onClick={handleTimestampClick}
    >
      {formattedTimestamp}
    </Button>
  );
};

export default PlayTranscriptBlockButton;
