import Transcript from "@/components/Transcript";
import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { deepgramResponse } from "@/deepgram";
import { NextPageWithLayout } from "@/pages/page";
import { User } from "@prisma/client";
import { useRef } from "react";

interface TranscriptionPageProps {
  user: User | null;
}

const Transcription: NextPageWithLayout<TranscriptionPageProps> = ({
  user,
}) => {
  const audioRef = useRef(null);
  const transcript = deepgramResponse.results.channels[0].alternatives[0].words;

  return (
    <>
      <HeadingSection
        title="Diarized Transcription"
        description="Click play, or click anywhere on the transcript to jump to that point in the audio."
      />

      <div>
        <audio
          src="deepest-question.mp3"
          controls
          ref={audioRef}
          className="sticky top-4 w-full z-50"
        />
        <Transcript transcript={transcript} audioRef={audioRef} />
      </div>
    </>
  );
};

export default Transcription;
Transcription.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
