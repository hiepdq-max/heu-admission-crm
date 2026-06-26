"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type PaymentSubmitButtonProps = {
  disabled?: boolean;
};

export function PaymentSubmitButton({
  disabled = false,
}: PaymentSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <Button
      aria-live="polite"
      className="w-full"
      disabled={isDisabled}
      type="submit"
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Save className="size-4" />
      )}
      {pending ? "Đang ghi nhận..." : "Ghi nhận chi P2-17"}
    </Button>
  );
}
