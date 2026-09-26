"use client";

import { Button, type ButtonProps } from "@/components/ui/button";

interface EnquiryButtonProps extends ButtonProps {
  children?: React.ReactNode;
  course?: string;
}

export function EnquiryButton({
  children,
  className,
  variant,
  size,
  course,
  onClick,
  ...props
}: EnquiryButtonProps) {
  return (
    <Button
      onClick={(e) => {
        if (onClick) onClick(e);
        window.dispatchEvent(
          new CustomEvent("kryso:open-enquiry", { detail: { course } })
        );
      }}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {children}
    </Button>
  );
}
