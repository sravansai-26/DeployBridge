import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { createProject, updateProject, Project } from "@/lib/storage";
import Layout from "@/components/layout/Layout";
import FileUpload from "@/components/deploy/FileUpload";
import ProviderSelect from "@/components/deploy/ProviderSelect";
import LogViewer from "@/components/deploy/LogViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Loader2,
  PartyPopper,
} from "lucide-react";

type Step = "upload" | "configure" | "deploy" | "success";

interface DeployResponse {
  success?: boolean;
  url?: string;
  logs?: string[];
  error?: string;
}

const Deploy = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [provider, setProvider] = useState<
    "vercel" | "netlify" | "firebase" | null
  >(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<
    "idle" | "building" | "deploying" | "success" | "error"
  >("idle");
  const [project, setProject] = useState<Project | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProjectName(selectedFile.name.replace(".zip", ""));
  };

  // 🚀 REAL BACKEND DEPLOYMENT
  const handleStartDeployment = async () => {
    if (!file || !provider || !projectName.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newProject = createProject(
      user.id,
      projectName.trim(),
      file.name,
      file.size
    );

    setProject(newProject);
    setStep("deploy");
    setStatus("building");
    setLogs(["Preparing deployment..."]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("provider", provider);
      formData.append("projectName", projectName.trim());

      const response = await fetch(`${BACKEND_URL}/api/deploy`, {
        method: "POST",
        body: formData,
      });

      let result: DeployResponse = {};
      try {
        result = (await response.json()) as DeployResponse;
      } catch {
        result = {};
      }

      // Handle error from backend
      if (!response.ok || result.success === false) {
        setStatus("error");
        updateProject(newProject.id, { status: "failed" });

        toast({
          title: "Deployment failed",
          description:
            result.error || "Server returned an invalid deployment response.",
          variant: "destructive",
        });
        return;
      }

      // Logs
      if (result.logs) setLogs(result.logs);

      // Live URL from backend (result.url)
      if (result.url) {
        setLiveUrl(result.url);
        updateProject(newProject.id, {
          status: "deployed",
          provider,
          liveUrl: result.url,
          deployedAt: new Date().toISOString(),
        });

        // Optional: open in new tab
        window.open(result.url, "_blank");
      } else {
        // deployed but no URL (very rare)
        updateProject(newProject.id, {
          status: "deployed",
          provider,
          deployedAt: new Date().toISOString(),
        });
      }

      setStatus("success");
      setStep("success");

      toast({
        title: "Deployment successful!",
        description: "Your project is now live.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown deployment error";

      setStatus("error");
      updateProject(newProject.id, { status: "failed" });

      toast({
        title: "Deployment failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case "upload":
        return (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Upload Your Project</h2>
              <p className="text-muted-foreground">
                Upload a ZIP file containing your project files
              </p>
            </div>

            <FileUpload onFileSelect={handleFileSelect} />

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                  />
                </div>

                <Button
                  onClick={() => setStep("configure")}
                  className="w-full"
                  disabled={!projectName.trim()}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        );

      case "configure":
        return (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Choose Deployment Provider
              </h2>
              <p className="text-muted-foreground">
                Select where you want to deploy your project
              </p>
            </div>

            <ProviderSelect selected={provider} onSelect={setProvider} />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("upload")}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleStartDeployment}
                className="flex-1"
                disabled={!provider}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Deploy Now
              </Button>
            </div>
          </motion.div>
        );

      case "deploy":
        return (
          <motion.div
            key="deploy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {status === "building"
                  ? "Building Your Project..."
                  : "Deploying..."}
              </h2>
              <p className="text-muted-foreground">
                This may take a moment. Please wait.
              </p>
            </div>

            <LogViewer logs={logs} status={status} />

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Deploying to {provider?.toUpperCase()}...
            </div>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success mx-auto"
            >
              <PartyPopper className="h-12 w-12" />
            </motion.div>

            <h2 className="text-2xl font-bold">Deployment Successful!</h2>
            <p className="text-muted-foreground">
              Your project "{projectName}" is now live.
            </p>

            {liveUrl && (
              <>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium break-all"
                >
                  {liveUrl}
                </a>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                  <Button asChild>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Live App
                    </a>
                  </Button>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setFile(null);
                  setProjectName("");
                  setProvider(null);
                  setLogs([]);
                  setStatus("idle");
                  setProject(null);
                  setLiveUrl(null);
                }}
              >
                Deploy Another
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {["upload", "configure", "deploy", "success"].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : ["upload", "configure", "deploy", "success"].indexOf(
                          step
                        ) > index
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {["upload", "configure", "deploy", "success"].indexOf(step) >
                  index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {index < 3 && (
                  <div
                    className={`h-1 w-8 mx-1 rounded ${
                      ["upload", "configure", "deploy", "success"].indexOf(step) >
                      index
                        ? "bg-success"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>
    </Layout>
  );
};

export default Deploy;
