"use client";
import MaxWidthWrapper from "@/components/atoms/max-width-wrapper";
import Image from "next/image";
import Link from "next/link";
import { MotionDiv } from "@/components/animated/motion-div";
import { cn } from "@/lib/utils";

export default function Qr() {
  return (
    <MaxWidthWrapper
      className={cn(
        "xl:place-content-center",
        "grid px-6 grid-cols-1 lg:px-0 relative z-50 h-full"
      )}
    >
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-center xs:gap-4 md:gap-10 lg:mt-28 xl:mt-0"
      >
        <p className="text-perameri dark:text-jakala">
          <Link href="/">&larr; Takaisin visailemaan</Link>
        </p>
        

        <Image
            src="/assets/images/qr.png"
            alt="QR-linkki"
            width={1152}
            height={1152}
            className="object-cover rounded-xl"
        />
        
      </MotionDiv>
    </MaxWidthWrapper>
  );
}
