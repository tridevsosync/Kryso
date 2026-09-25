"use client";

import { Button, type ButtonProps } from "@/components/ui/button";

interface EnquiryButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

export function EnquiryButton({ children, className, variant, size, ...props }: EnquiryButtonProps) {
  return (
    <Button
      onClick={() => window.dispatchEvent(new CustomEvent("kryso:open-enquiry"))}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {children}
    </Button>
  );
}
