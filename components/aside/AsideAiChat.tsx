import { Button, Card, ScrollArea, Stack, Text, Textarea } from "@mantine/core";
import { useCallback, useState } from "react";

interface IAsideAiChat {
  fileId: string;
  transcriptId: string;
}

export const AsideAiChat: React.FC<IAsideAiChat> = ({
  fileId,
  transcriptId,
}) => {
  const [question, setQuestion] = useState<string>("");
  const [generatingAnswer, setGeneratingAnswer] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>("");

  const handleSubmitQuestion = useCallback(async () => {
    if (!question) {
      return;
    }

    setGeneratingAnswer(true);

    const res = await fetch("/api/answer-question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        fileId,
        transcriptId,
      }),
    });

    if (res.status === 200) {
      setQuestion("");
      const answer = await res.json();
      console.log(answer.response.text);
      setAnswer(answer.response.text);
      setGeneratingAnswer(false);
    }
  }, [fileId, transcriptId, question]);
  return (
    <Card padding={"xs"} withBorder h={"100%"}>
      <Stack justify="space-between" h={"100%"}>
        <Stack>
          <Text weight={500}>Ask a question about this interview</Text>
          <ScrollArea h={"32rem"}>
            {answer && (
              <Text
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {answer}
              </Text>
            )}
          </ScrollArea>
        </Stack>
        <Stack spacing={"xs"}>
          <Textarea
            minRows={4}
            size="sm"
            placeholder="What did the participants have most trouble with?"
            value={question}
            onChange={(e) => setQuestion(e.currentTarget.value)}
          />
          <Button
            size="sm"
            p={"xs"}
            loading={generatingAnswer}
            onClick={handleSubmitQuestion}
          >
            Ask
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};
