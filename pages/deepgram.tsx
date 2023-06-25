import Transcript from "@/components/Transcript";
import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { deepgramResponse } from "@/deepgram";
import { NextPageWithLayout } from "@/pages/page";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRef } from "react";

interface TranscriptionPageProps {}

const TranscriptionPage: NextPageWithLayout<TranscriptionPageProps> = () => {
  const audioRef = useRef(null);
  const transcript = deepgramResponse.results.channels[0].alternatives[0].words;

  const session = useSession();
  const user = session.data?.user as User;

  return (
    <>
      <HeadingSection
        title="Diarized Transcription"
        description="Click play, or click anywhere on the transcript to jump to that point in the audio."
      />

      <div>
        <audio
          // src="deepest-question.mp3"
          src="https://transcription-diarization.s3.ca-central-1.amazonaws.com/deepest-question.mp3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQD9arzj3feKeuEfVtgLJeTRhhnk5VFAloS8vq93kAhSJQIhAM3y7yROHcfKR6mQQKcesi4liwdV02PU%2B5uhzQANMQHwKvsCCDEQABoMOTcyNzgzNjA5NjMwIgzDgAW6kmx%2FW3sMpQ4q2AIYL4DKKahos1qqTiYaUwR%2BXH7kqCOGkoNH7kbkRXjj4JdFwcRXOF8ETMuyjCsfn4PFb%2FZHdhw2pNz8yyU95rmL%2BiP2saHqretz9a8wx%2BYwIWsPpZ5SuiDIEswMu%2B17zMu9GyPqUhYklOWjgtMMycM65s7eiNf7OSQDORURc5wQifyBMxPmOsG3kkIPHmEn0k3SL5EhcD8akiugTyIaliBG%2FuWCoJo7iv%2F449EWZ652waOgucUvC45U%2BQVVNpEnsYKQpZIV68YiTJ7aV5X2ahGKYRA8AfwRgvRtioRr2QsGpUPzUpKWwbQqGEgMu%2BuLfX1twWxbFu%2BDYEq43Ifaym5GxRfmi0LRgfWHFjusrynQmNvpV3uCP%2F8%2BBQjxXFby6gfXeJKLx5mLc7eUKDkuh6xECUjNcUrdB1fSLYwYWr9fGFYrx1CbTbdxyJj5%2BXmLXNjWAdVPwNQ0TTDfxOGkBjqyAm2WToNPDKY1zBzmSuafvLRUC85ek4ARxLtOKo0iXAqSmLO3VBK0HMOgR32FlyjjqfeP5VCSRkULUc0nj0axTlwf4TZH1SEeuZpPDYV3hoBmBGs6lvPJoSW%2BXVY22m%2FPX4PAJ3OULYQX%2FtpW2nbCw51lvyPrU%2BSlSsQ1xLCFEdOgrSK%2FYVk1kYz7MXvE21KK3RcYnumRKLB%2BCN%2BjrWGxybdALUp4XrHSwvXC72J5u8dccU2hZu8odzdm7Srs%2BApbfPjsAmdXqc6A8P1zPtv2ywL6m%2BWnhQoWd%2B1wwlzA9C58%2BGoLK%2FUwftnDxKrexnGHuQZoCLay%2Fh822ecWDHiMWKJgR7Rf5kS%2FSlzbFoe%2FSZ44z3HqFi92jxxAKvkU1p2JMyJopfD50AZhaTw%2FYQgv3O7s2w%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230625T155112Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIA6E7TL44PJCTEHYLP%2F20230625%2Fca-central-1%2Fs3%2Faws4_request&X-Amz-Signature=335e3c279d027a5259c82ea04aa97dd47bbd4f21a4aaaab810ea6bceba890225"
          controls
          ref={audioRef}
          className="sticky top-4 w-full z-50"
        />
        <Transcript transcript={transcript} audioRef={audioRef} user={user} />
      </div>
    </>
  );
};

export default TranscriptionPage;
TranscriptionPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
