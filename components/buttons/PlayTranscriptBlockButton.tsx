import convertToTimestamp from "@/utils/convertToTimestamp";
import { Button, useMantineTheme } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { FC, useMemo } from "react";

interface IPlayTranscriptBlockButton {
  mediaRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  startingTimestamp: number;
}

const PlayTranscriptBlockButton: FC<IPlayTranscriptBlockButton> = ({
  mediaRef,
  startingTimestamp,
}) => {
  const theme = useMantineTheme();

  const formattedTimestamp = useMemo(() => {
    return convertToTimestamp(startingTimestamp);
  }, [startingTimestamp]);

  const handleTimestampClick = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = startingTimestamp;
      mediaRef.current.play();
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
