import { useState } from "react";

const CommentForm: React.FC<{ onSubmit: (note: string) => void }> = ({
  onSubmit,
}) => {
  const [note, setNote] = useState("");

  return (
    <div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} />
      <button onClick={() => onSubmit(note)}>Add Note</button>
    </div>
  );
};

export default CommentForm;
