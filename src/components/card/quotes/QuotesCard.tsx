import { quotes } from "@/lib/quotes";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const QuotesCard: React.FC = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const { text, author, company } = quotes[currentQuoteIndex];

  return (
    <div className="flex flex-col items-center justify-center bg-white m-4 md:m-12 py-12 px-8 rounded-xl shadow-md w-full max-w-lg mx-auto">
      <blockquote className="text-black italic mb-4 transition-opacity duration-1000 ease-in-out">
        <p className="text-lg">“{text}”</p>
        <footer className="mt-4 text-sm">
          - {author}, {company}
        </footer>
      </blockquote>
      <div className="text-[#004fa2] font-bold text-xl mt-6">
        250 billion+ happy customers
      </div>
      <div className="text-gray-500">created for happy customers</div>
      <div className="flex justify-center mt-4 space-x-4">
        <Image
          width={32}
          height={32}
          src="/company-logos/google.svg"
          alt="Google"
        />
        <Image
          width={32}
          height={32}
          src="/company-logos/apple.svg"
          className="h-8"
          alt="apple"
        />
        <Image
          width={32}
          height={32}
          src="/company-logos/meta.svg"
          alt="Apple"
        />
        <Image
          width={32}
          height={32}
          src="/company-logos/openai.svg"
          alt="Microsoft"
        />
      </div>
      <div className="flex justify-center mt-4">
        {quotes.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              index === currentQuoteIndex ? "bg-orange-500" : "bg-gray-300"
            }`}
            onClick={() => setCurrentQuoteIndex(index)}
            aria-label={`View quote ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuotesCard;
