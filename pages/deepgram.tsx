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
          // src="deepest-question.mp3"
          src="https://transcription-diarization.s3.ca-central-1.amazonaws.com/deepest-question.mp3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQDFnxgUle%2FIULcMObGvhhJ%2B8hG1QzVc7DTIJqhNrCO0kQIhAP9bT4EJoJIFq391rQqF9%2BOX99nO7eAGrb0aG70USg%2FlKoQDCPz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMOTcyNzgzNjA5NjMwIgyHTJRkoeHbhZA74w4q2AILsbKUUQF%2FgOzvUp9mNxFHH3jPFmws%2Bs%2FdFNbfU73NhsR0r784oTHhDMW%2BCJG4H6M1ABYJdJRIoxatyvrGTm5%2Fhpsb4PUGEc9Fe%2F0SQBRN8ZDDiMOFqwazA4VdDQWIJSo1J6KKhFQXtiJqQoXtvw6b53He%2FqLCi5ml70rKydz9wnX0s3gE4elkIiB6KjSnYNuGsenAz9ssV4mjM1APGMrXofaO4VC1xsrYWV293bp289AZ5j7yAEQEX7fta7xPHIkWQZX7Cju%2FByDIrssqOUqoN324nlXYQQxlISFGmaYWZN2ZJTj5JPi9idm%2FDN1G6z283OCgeT%2FdCN5jXiKYXNgD48eNR2GnopOXOs0b9X8SHjmhfehh0W5oUWCLnEwVDYTZXOHGPwJ%2B5DznPxyxLFXobYTY%2BaC8iqLJt0T6So3rM7RvTdrcekEXjdlBrg0Hl0nRy%2FjX2hFvYTCcudmkBjqyAogZAQCmre1v7uIKsfCB09U%2B%2BDkhh8oFLX9QcY74KU0UbjkGsf1cBMxzI624y13X6ElC8tA0v5O3X7kXmTLHOgjCgXoBwr3wBllhVxrSta4Ko1mb2LbdraodsfTbU4Pxy3caUjUJSQz0FxSeNK7SLdcYk2rl6ZrWvTSW5j8F4uV5lk59pq9OPtDsfp3L1ylQdS9Q7TN%2Fcc%2FF613RaluOwaJb3aqn6sk2uZQpYF%2B%2B73jT3iJdHsP2tYuv6sQ%2BLyz2lEebaaQrRMhsVQQm%2FOBDSuM09FXMXGH%2BznPXV1nsFBaXHdGaJZECm7OO6FhdqBq1ZDxCGpfdTP3f94iyfAGtJUaf6C8E9I3Nv74SSuSvpWHmR4W4%2FTn0cdKCjY6ifsF2vHQTbC1F52YuHsKMPIwhWGJBcw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230624T030207Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIA6E7TL44PEI7KHYPG%2F20230624%2Fca-central-1%2Fs3%2Faws4_request&X-Amz-Signature=8e9b90522965c551aedb703b62aa94ff4b8aa356ad1cfe2e85684b3c7c06f505"
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
