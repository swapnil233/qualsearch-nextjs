import { NoteWithTagsAndCreator } from "@/types";
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

interface NotesContextProps {
  notes: NoteWithTagsAndCreator[];
  setNotes: React.Dispatch<React.SetStateAction<NoteWithTagsAndCreator[]>>;
}

interface NotesProviderProps {
  children: ReactNode;
  initialNotes: NoteWithTagsAndCreator[];
}

const NotesContext = createContext<NotesContextProps | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};

export const NotesProvider: FC<NotesProviderProps> = ({
  children,
  initialNotes,
}) => {
  const [notes, setNotes] = useState<NoteWithTagsAndCreator[]>(initialNotes);

  return (
    <NotesContext.Provider value={{ notes, setNotes }}>
      {children}
    </NotesContext.Provider>
  );
};
