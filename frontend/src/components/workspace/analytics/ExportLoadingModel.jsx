import { useEffect, useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Check,
  Loader2,
} from "lucide-react";

export default function ExportLoadingModal({
  open,
  type,
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }

    setStep(0);

    const interval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, 2));
    }, 1000);

    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  const config = {
    pdf: {
      icon: (
        <FileText
          size={34}
          className="text-red-500"
        />
      ),
      title: "Generating PDF Report",
      subtitle:
        "We're preparing your workspace analytics report.",
      steps: [
        "Collecting analytics",
        "Building visual summary",
        "Formatting PDF",
      ],
      iconBg: "bg-red-50",
    },

    csv: {
      icon: (
        <FileSpreadsheet
          size={34}
          className="text-green-600"
        />
      ),
      title: "Exporting CSV",
      subtitle:
        "Preparing workspace task data for download.",
      steps: [
        "Collecting workspace tasks",
        "Formatting CSV",
        "Preparing download",
      ],
      iconBg: "bg-green-50",
    },
  };

  const current = config[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-8">

        <div
          className={`mx-auto flex h-18 w-18 items-center justify-center rounded-2xl ${current.iconBg}`}
        >
          {current.icon}
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold text-text-primary">
          {current.title}
        </h2>

        <p className="mt-2 text-center text-sm text-text-secondary">
          {current.subtitle}
        </p>

        <div className="mt-8 space-y-4">

          {current.steps.map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-3"
            >

              {index < step ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <Check
                    size={14}
                    className="text-green-600"
                  />
                </div>
              ) : index === step ? (
                <Loader2
                  size={20}
                  className="animate-spin text-primary"
                />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
              )}

              <span
                className={`text-sm ${
                  index <= step
                    ? "text-text-primary font-medium"
                    : "text-slate-400"
                }`}
              >
                {item}
              </span>
            </div>
          ))}

        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          This usually takes a few seconds.
        </p>

      </div>

    </div>
  );
}