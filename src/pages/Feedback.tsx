import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { createFeedback } from '@/lib/storage';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Star, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Feedback = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: '' as 'suggestion' | 'bug' | 'other' | '',
    subject: '',
    message: '',
    rating: 0,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    createFeedback(
      user.id,
      formData.type as 'suggestion' | 'bug' | 'other',
      formData.subject,
      formData.message,
      formData.rating || null
    );

    setIsSubmitting(false);
    setIsSubmitted(true);

    toast({
      title: 'Feedback submitted!',
      description: 'Thank you for helping us improve DeployBridge.',
    });
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      type: '',
      subject: '',
      message: '',
      rating: 0,
    });
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success mx-auto mb-6"
            >
              <CheckCircle className="h-12 w-12" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-8">
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
            </p>

            <Button onClick={handleReset}>
              Submit Another Feedback
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Share Your Feedback</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Help us make DeployBridge better. Your suggestions, bug reports, and reviews are invaluable.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Feedback Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as 'suggestion' | 'bug' | 'other' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">💡 Suggestion</SelectItem>
                    <SelectItem value="bug">🐛 Bug Report</SelectItem>
                    <SelectItem value="other">📝 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief summary of your feedback"
                  maxLength={100}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your feedback in detail..."
                  rows={5}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.message.length}/1000
                </p>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Rating (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  How would you rate your experience with DeployBridge?
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="group"
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-all",
                          formData.rating >= star
                            ? "fill-warning text-warning"
                            : "text-muted-foreground/30 group-hover:text-warning/50"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Feedback;
