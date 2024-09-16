import convertToTimestamp from "@/lib/convertToTimestamp";
import { Button, useMantineColorScheme } from "@mantine/core";
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
  const { colorScheme } = useMantineColorScheme();

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
      color={colorScheme === "dark" ? "gray" : "dark"}
      size="compact-md"
      leftSection={<IconPlayerPlay size={"1rem"} />}
      onClick={handleTimestampClick}
    >
      {formattedTimestamp}
    </Button>
  );
};

export default PlayTranscriptBlockButton;
