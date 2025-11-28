import { useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getProjects, Project } from "@/lib/storage";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Rocket,
  ExternalLink,
  Clock,
  FolderOpen,
  Search,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors = {
  uploaded: "bg-muted text-muted-foreground border",
  building: "bg-warning/10 text-warning border-warning/20 border",
  deploying: "bg-primary/10 text-primary border-primary/20 border",
  deployed: "bg-success/10 text-success border-success/20 border",
  failed: "bg-destructive/10 text-destructive border-destructive/20 border",
};

const providerNames = {
  vercel: "Vercel",
  netlify: "Netlify",
  firebase: "Firebase",
};

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Auto-refresh dashboard when returning from /deploy
  useEffect(() => {
    if (user) {
      setProjects(getProjects(user.id));
    }
  }, [user, location.pathname]);

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

  const filteredProjects = projects.filter((project) => {
    const matchSearch = project.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

    const matchStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-hero text-3xl font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(user.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    {projects.length} project
                    {projects.length !== 1 ? "s" : ""} deployed
                  </div>
                </div>
              </div>

              <Button asChild>
                <Link to="/deploy">
                  <Rocket className="h-4 w-4 mr-2" />
                  New Deployment
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">Your Projects</h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="deploying">Deploying</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {searchTerm || statusFilter !== "all"
                  ? "No projects match your filters. Try adjusting your search."
                  : "Start by uploading your first project to deploy it to your favorite platform."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button asChild>
                  <Link to="/deploy">
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy Your First Project
                  </Link>
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group rounded-xl border border-border bg-card p-4 md:p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Rocket className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{project.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(project.createdAt)}
                          </div>
                          {project.provider && (
                            <Badge variant="outline">
                              {providerNames[project.provider] ?? "Unknown"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[project.status]}>
                        {project.status.charAt(0).toUpperCase() +
                          project.status.slice(1)}
                      </Badge>

                      {project.status === "deployed" && project.liveUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Live
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
