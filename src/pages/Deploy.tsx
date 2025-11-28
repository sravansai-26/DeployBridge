import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { createProject, updateProject, Project } from '@/lib/storage';
import Layout from '@/components/layout/Layout';
import FileUpload from '@/components/deploy/FileUpload';
import ProviderSelect from '@/components/deploy/ProviderSelect';
import LogViewer from '@/components/deploy/LogViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Rocket, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  ExternalLink,
  Loader2,
  PartyPopper
} from 'lucide-react';

type Step = 'upload' | 'configure' | 'deploy' | 'success';

const buildLogs = [
  '> Initializing build environment...',
  '> Extracting project files...',
  '✓ Found package.json',
  '✓ Detected React application',
  '> Installing dependencies...',
  '  npm install',
  '  added 1247 packages in 12s',
  '> Analyzing project configuration...',
  '✓ Found vite.config.ts',
  '✓ TypeScript configuration detected',
  '> Checking for deployment requirements...',
  '⚠ Warning: No vercel.json found, creating default configuration',
  '✓ Created vercel.json with optimal settings',
  '> Building project...',
  '  vite build',
  '  ✓ 142 modules transformed',
  '  dist/index.html                 0.46 kB │ gzip:  0.30 kB',
  '  dist/assets/index-DYzq7j4K.css  5.82 kB │ gzip:  1.87 kB',
  '  dist/assets/index-BxH2Kl9w.js  178.42 kB │ gzip: 57.14 kB',
  '✓ Build completed successfully!',
  '> Optimizing assets...',
  '✓ Images optimized',
  '✓ CSS minified',
  '✓ JavaScript bundled and minified',
];

const deployLogs = [
  '> Preparing deployment package...',
  '> Uploading to deployment server...',
  '  Uploaded: dist/index.html',
  '  Uploaded: dist/assets/index-DYzq7j4K.css',
  '  Uploaded: dist/assets/index-BxH2Kl9w.js',
  '> Configuring domain and SSL...',
  '✓ SSL certificate provisioned',
  '✓ Domain configured',
  '> Running deployment checks...',
  '✓ Health check passed',
  '✓ Performance check passed',
  '> Finalizing deployment...',
  '✓ Deployment successful!',
];

const Deploy = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [provider, setProvider] = useState<'vercel' | 'netlify' | 'firebase' | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'building' | 'deploying' | 'success' | 'error'>('idle');
  const [project, setProject] = useState<Project | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProjectName(selectedFile.name.replace('.zip', ''));
  };

  const handleStartBuild = async () => {
    if (!file || !provider || !projectName.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Create project in storage
    const newProject = createProject(user.id, projectName, file.name, file.size);
    setProject(newProject);
    setStep('deploy');
    setStatus('building');
    setLogs([]);

    // Simulate build logs
    for (let i = 0; i < buildLogs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 200));
      setLogs((prev) => [...prev, buildLogs[i]]);
    }

    // Update project status
    updateProject(newProject.id, { status: 'building', provider });
    setStatus('deploying');

    // Simulate deploy logs
    for (let i = 0; i < deployLogs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));
      setLogs((prev) => [...prev, deployLogs[i]]);
    }

    // Generate fake live URL
    const generatedUrl = `https://${projectName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8)}.${provider === 'vercel' ? 'vercel.app' : provider === 'netlify' ? 'netlify.app' : 'web.app'}`;
    setLiveUrl(generatedUrl);

    // Update project as deployed
    updateProject(newProject.id, {
      status: 'deployed',
      liveUrl: generatedUrl,
      deployedAt: new Date().toISOString(),
    });

    setStatus('success');
    setStep('success');

    toast({
      title: 'Deployment successful!',
      description: 'Your project is now live.',
    });
  };

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                  />
                </div>

                <Button 
                  onClick={() => setStep('configure')} 
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

      case 'configure':
        return (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Provider</h2>
              <p className="text-muted-foreground">
                Select where you want to deploy your project
              </p>
            </div>

            <ProviderSelect selected={provider} onSelect={setProvider} />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleStartBuild} 
                className="flex-1"
                disabled={!provider}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Start Deployment
              </Button>
            </div>
          </motion.div>
        );

      case 'deploy':
        return (
          <motion.div
            key="deploy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {status === 'building' ? 'Building Your Project' : 'Deploying to ' + (provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : '')}
              </h2>
              <p className="text-muted-foreground">
                {status === 'building' 
                  ? 'Analyzing and building your project...'
                  : 'Uploading and configuring your deployment...'}
              </p>
            </div>

            <LogViewer logs={logs} status={status} />

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Please wait while we deploy your project...
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success mx-auto"
            >
              <PartyPopper className="h-12 w-12" />
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold mb-2">Deployment Successful!</h2>
              <p className="text-muted-foreground">
                Your project "{projectName}" is now live and ready to share.
              </p>
            </div>

            {liveUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="text-sm text-muted-foreground mb-2">Live URL</p>
                <a 
                  href={liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium break-all"
                >
                  {liveUrl}
                </a>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {liveUrl && (
                <Button asChild>
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Live App
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setProjectName('');
                  setProvider(null);
                  setLogs([]);
                  setStatus('idle');
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
            {['upload', 'configure', 'deploy', 'success'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    step === s
                      ? 'bg-primary text-primary-foreground'
                      : ['upload', 'configure', 'deploy', 'success'].indexOf(step) > index
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {['upload', 'configure', 'deploy', 'success'].indexOf(step) > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 w-8 mx-1 rounded ${
                      ['upload', 'configure', 'deploy', 'success'].indexOf(step) > index
                        ? 'bg-success'
                        : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Deploy;
