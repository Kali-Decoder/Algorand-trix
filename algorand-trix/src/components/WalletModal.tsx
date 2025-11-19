"use client";

import React , { useEffect }  from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
          document.body.classList.add("modal-open");
        } else {
          document.body.classList.remove("modal-open");
        }
      }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    console.log('Dialog onOpenChange:', open);
    // onOpenChange receives a boolean, but onClose expects no params
    // So we call onClose when dialog is being closed (open === false)
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg z-[100]" >{children}</DialogContent>
    </Dialog>
  )
}
