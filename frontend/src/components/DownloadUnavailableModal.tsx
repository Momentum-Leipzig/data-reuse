"use client";

import { useEffect } from "react";

type DownloadUnavailableModalProps = {
  onClose: () => void;
};

export default function DownloadUnavailableModal({
  onClose,
}: DownloadUnavailableModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-unavailable-title"
        className="relative w-full max-w-xs sm:max-w-lg rounded-2xl bg-white p-5 sm:p-8 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-lmp-text hover:text-lmp-text/70 transition cursor-pointer text-4xl leading-none"
        >
          &times;
        </button>
        <h2
          id="download-unavailable-title"
          className="text-lmp-text text-xl font-bold pr-8 mb-4"
        >
          Download temporarily not available
        </h2>
        <p className="text-lmp-text text-sm">
          Due to{" "}
          <a
            href="https://www.cos.io/osf-changes"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-lmp-text/70 transition"
          >
            unexpected changes
          </a>{" "}
          at the Open Science Framework (OSF) as our initially intended
          repository, we are currently in the process of identifying a suitable
          alternative repository for storing and sharing our data. The data are
          therefore not yet publicly available, but will be made available in
          the near future. We apologize for the delay and any inconvenience this
          may cause.
        </p>
      </div>
    </div>
  );
}
