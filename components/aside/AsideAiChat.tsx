import { ApiMessage, Message, UserMessage } from "@/types"; // assuming these types are defined
import {
  Button,
  Card,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { FormEvent, KeyboardEvent, useRef, useState } from "react";
import ChatSuggestionButton from "../buttons/ChatSuggestionButton";

interface IAsideAiChatProps {
  fileId: string;
  transcriptId: string;
}

export interface IMessageState {
  messages: Message[];
  history: [string, string][];
  pendingSourceDocs?: Document[];
}

export const AsideAiChat: React.FC<IAsideAiChatProps> = ({
  fileId,
  transcriptId,
}) => {
  const { data: session } = useSession();
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<IMessageState>({
    messages: [
      {
        message: "What would you like to know about this interview?",
        type: "apiMessage",
      },
    ],
    history: [],
  });

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleMessageSubmit = async (
    e: FormEvent,
    suggestedMessage?: string
  ) => {
    e.preventDefault();

    const messageToSend = suggestedMessage || query.trim();

    if (!messageToSend) {
      notifications.show({
        title: "Please enter a question",
        message: "You can't send an empty message",
        color: "red",
      });
      return;
    }

    const newMessage: UserMessage = {
      type: "userMessage",
      message: messageToSend,
    };

    updateMessages(newMessage);
    setLoading(true);
    setQuery("");

    // Send the messages to the API
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newMessage.message,
          history: messageState.history,
          fileId,
          transcriptId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        notifications.show({
          title: "An error occurred",
          message: data.error,
          color: "red",
        });
      } else {
        const apiMessage: ApiMessage = {
          type: "apiMessage",
          message: data.text,
          sourceDocs: data.sourceDocuments,
        };

        updateMessages(apiMessage, newMessage.message, data.text);
      }
    } catch (error) {
      setError("An error occurred while fetching the data. Please try again.");
      notifications.show({
        title: "An error occurred",
        message: "An error occurred while fetching the data. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSubmit = (suggestion: string) => {
    return (e: FormEvent) => handleMessageSubmit(e, suggestion);
  };

  const updateMessages = (
    newMessage: Message,
    question?: string,
    answer?: string
  ) => {
    setMessageState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, newMessage],
      history:
        question && answer
          ? [...prevState.history, [question, answer]]
          : prevState.history,
    }));

    scrollToBottom();
  };

  const scrollToBottom = () => {
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  };

  const handleEnterPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (query) {
        handleMessageSubmit(e as unknown as FormEvent);
      }
    }
  };

  return (
    <Card padding={"xs"} withBorder>
      <Stack justify="space-between">
        <Stack>
          <Text weight={500}>Ask a question about this interview</Text>
          <ScrollArea h={"32rem"} ref={messageListRef}>
            <Stack spacing={"lg"}>
              {messageState.messages.map((message, index) => (
                <Group
                  noWrap
                  key={`chatMessage-${index}`}
                  spacing={"xs"}
                  align="start"
                >
                  <Image
                    src={
                      message.type === "apiMessage"
                        ? "/bot.png"
                        : session?.user?.image || "/user-image.png"
                    }
                    alt={
                      message.type === "apiMessage"
                        ? "AI"
                        : `The profile picture of the user ${session?.user?.name}`
                    }
                    width="30"
                    height="30"
                    priority
                  />
                  <Stack spacing={4}>
                    <Stack spacing={2}>
                      <Text weight={500}>
                        {message.type === "apiMessage"
                          ? "QualSearch AI"
                          : `${session?.user?.name || "You"}`}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {new Date().toLocaleString()}
                      </Text>
                    </Stack>
                    <Text style={{ whiteSpace: "pre-wrap" }}>
                      {message.message}
                    </Text>
                  </Stack>
                </Group>
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
        <Stack>
          {messageState.messages.length === 1 && (
            <Stack spacing={"xs"}>
              <ChatSuggestionButton
                suggestion={"What were the major pain points?"}
                handleSubmit={handleSuggestionSubmit(
                  "What were the major pain points?"
                )}
              />
              <ChatSuggestionButton
                suggestion={"How can the product be improved?"}
                handleSubmit={handleSuggestionSubmit(
                  "How can the product be improved?"
                )}
              />
            </Stack>
          )}
          <form onSubmit={handleMessageSubmit}>
            <Stack spacing={"xs"}>
              <Textarea
                disabled={loading}
                onKeyDown={handleEnterPress}
                ref={textAreaRef}
                autoFocus={false}
                rows={1}
                maxLength={512}
                id="userInput"
                name="userInput"
                placeholder={
                  loading
                    ? "Waiting for response..."
                    : "What did the user think about..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit" loading={loading}>
                Ask
              </Button>
            </Stack>
          </form>
        </Stack>
      </Stack>
    </Card>
  );
};
