import { TagWithNoteIds } from "@/types";
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

interface TagsContextProps {
  tags: TagWithNoteIds[];
  setTags: React.Dispatch<React.SetStateAction<TagWithNoteIds[]>>;
}

interface TagsProviderProps {
  children: ReactNode;
  initialTags: TagWithNoteIds[];
}

const TagsContext = createContext<TagsContextProps | undefined>(undefined);

export const useTags = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error("useTags must be used within a TagsProvider");
  }
  return context;
};

export const TagsProvider: FC<TagsProviderProps> = ({
  children,
  initialTags,
}) => {
  const [tags, setTags] = useState<TagWithNoteIds[]>(initialTags);

  return (
    <TagsContext.Provider value={{ tags, setTags }}>
      {children}
    </TagsContext.Provider>
  );
};
