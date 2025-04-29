import React, { useRef, useEffect, useState } from "react";
import { useChatContext } from "../../context/ChatContext";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { Message } from "../../types";

interface PreprocessorResponse {
  action: "reject" | "inform_and_pass" | "pass" | "error";
  message?: string;
  original_prompt?: string;
  reason?: string;
  error?: string;
}


interface GeneratorResponse {
  response?: string;
  error?: string;
}

const PREPROCESSOR_API_URL = "http://localhost:5001/preprocess";
const GENERATOR_API_URL = "http://localhost:5001/generate";

const ChatContainer: React.FC = () => {
  const {
    messages,
    addMessage,
    activeConversation,
    conversations,
  } = useChatContext();

  const messageEndRef = useRef<HTMLDivElement>(null);
  const activeChat = conversations.find((c) => c.id === activeConversation);
  const chatTitle = activeChat?.title || "New Chat";
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callGeneratorAPI = async (prompt: string) => {
    try {
      const response = await fetch(GENERATOR_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      const result: GeneratorResponse = await response.json();

      if (!response.ok || result.error) {
        throw new Error(
          result.error || `Echec: ${response.statusText}`,
        );
      }

      if (result.response) {
        const aiResponseMessage: Message = {
          id: `assist-ai-${Date.now()}`,
          content: result.response,
          sender: "bot",
          timestamp: new Date(),
        };
        addMessage(aiResponseMessage.content, aiResponseMessage.sender);
      } else {
        throw new Error("Reponse vide du model.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      const networkErrorMessage: Message = {
        id: `assist-gen-error-${Date.now()}`,
        content: `Pas de reponse du model local. ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
        sender: "bot",
        timestamp: new Date(),
      };
      addMessage(networkErrorMessage.content, networkErrorMessage.sender);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: content,
      sender: "user",
      timestamp: new Date(),
    };
    addMessage(userMessage.content, userMessage.sender);

    try {
      const preprocessResponse = await fetch(PREPROCESSOR_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      });

      const preprocessResult: PreprocessorResponse =
        await preprocessResponse.json();

      if (!preprocessResponse.ok || preprocessResult.error) {
        throw new Error(
          preprocessResult.error ||
            `Preprocessour a echoue: ${preprocessResponse.statusText}`,
        );
      }

      switch (preprocessResult.action) {
        case "reject":
          if (preprocessResult.message) {
            const rejectionMessage: Message = {
              id: `assist-${Date.now()}`,
              content: preprocessResult.message,
              sender: "bot",
              timestamp: new Date(),
            };
            setTimeout(() => addMessage(rejectionMessage.content, rejectionMessage.sender), 300);
          }
          setIsProcessing(false);
          break;

        case "inform_and_pass":
          if (preprocessResult.message) {
            const infoMessage: Message = {
              id: `assist-info-${Date.now()}`,
              content: preprocessResult.message,
              sender: "bot",
              timestamp: new Date(),
            };
            setTimeout(() => addMessage(infoMessage.content, infoMessage.sender), 300);
          }
          if (preprocessResult.original_prompt) {
            setTimeout(
              () => callGeneratorAPI(preprocessResult.original_prompt!),
              500,
            );
          } else {
            setIsProcessing(false);
          }
          break;

        case "pass":
          if (preprocessResult.original_prompt) {
            await callGeneratorAPI(preprocessResult.original_prompt);
          } else {
            setIsProcessing(false);
          }
          break;

        default:
          console.error("Action pre-processeur:", preprocessResult);
          throw new Error("Reponse non expecte du pre processeur.");
      }
    } catch (error) {
      console.error("Error during message handling:", error);
      const networkErrorMessage: Message = {
        id: `assist-proc-error-${Date.now()}`,
        content: `Une erreur est apparue pendant votre requete. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        sender: "bot",
        timestamp: new Date(),
      };
      addMessage(networkErrorMessage.content, networkErrorMessage.sender);
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <ChatHeader title={chatTitle} />

      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isTyping={
            useChatContext().isTyping
          }
          messageEndRef={messageEndRef}
        />
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isProcessing} />
    </div>
  );
};

export default ChatContainer;
