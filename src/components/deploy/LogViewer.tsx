import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogViewerProps {
  logs: string[];
  status: "idle" | "building" | "deploying" | "success" | "error";
}

const LogViewer = ({ logs, status }: LogViewerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getStatusIcon = () => {
    switch (status) {
      case "building":
      case "deploying":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Terminal className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "building":
        return "Building...";
      case "deploying":
        return "Deploying...";
      case "success":
        return "Deployment Successful!";
      case "error":
        return "Deployment Failed";
      default:
        return "Ready";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-foreground/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Build Output</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          <span
            className={cn(
              status === "success" && "text-success",
              status === "error" && "text-destructive"
            )}
          >
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Logs */}
      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto p-4 font-mono text-sm bg-[#1a1a2e] text-green-400"
      >
        <AnimatePresence initial={false}>
          <>
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "py-0.5",
                  log.includes("error") || log.includes("Error")
                    ? "text-red-400"
                    : "",
                  log.includes("warning") || log.includes("Warning")
                    ? "text-yellow-400"
                    : "",
                  log.includes("success") || log.includes("✓")
                    ? "text-green-400"
                    : "",
                  log.startsWith(">")
                    ? "text-cyan-400"
                    : ""
                )}
              >
                <span className="text-muted-foreground mr-2 select-none">
                  {String(index + 1).padStart(3, " ")}
                </span>
                {log}
              </motion.div>
            ))}
          </>
        </AnimatePresence>

        {(status === "building" || status === "deploying") && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="inline-block w-2 h-4 bg-green-400 ml-1"
          />
        )}
      </div>
    </div>
  );
};

export default LogViewer;
