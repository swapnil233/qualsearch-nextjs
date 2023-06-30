import { Button } from "@mantine/core";
import Image from "next/image";
import { FC, ReactNode } from "react";

export interface IEmptyState {
  title: string;
  description: string;
  imageUrl: string;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  primaryButtonIcon?: ReactNode;
}

const EmptyState: FC<IEmptyState> = ({
  title,
  description,
  primaryButtonAction,
  primaryButtonIcon,
  primaryButtonText,
  imageUrl,
}) => {
  return (
    <section className="w-full flex flex-col justify-center items-center py-7 max-w-3xl mx-auto">
      <Image
        width={"225"}
        height={"180"}
        alt="Empty state image"
        src={imageUrl}
      />
      <div className="mb-6 mt-6 text-center">
        <h3 className="font-medium text-2xl text-[#172B4D] mb-4">{title}</h3>
        <p className="w-80 flex font-normal line-height-1 text-sm justify-center">
          {description}
        </p>
      </div>
      <Button
        sx={{
          backgroundColor: "#0052CC",
          ":hover": {
            backgroundColor: "#013c94",
          },
        }}
        leftIcon={primaryButtonIcon}
        onClick={primaryButtonAction}
      >
        {primaryButtonText}
      </Button>
    </section>
  );
};

export default EmptyState;
