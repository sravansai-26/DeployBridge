import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Provider {
  id: "vercel" | "netlify" | "firebase";
  name: string;
  description: string;
  color: string;
  icon: string;
}

const providers: Provider[] = [
  {
    id: "vercel",
    name: "Vercel",
    description: "Best for Next.js & React apps",
    color: "from-foreground to-foreground/80",
    icon: "▲",
  },
  {
    id: "netlify",
    name: "Netlify",
    description: "Great for static sites & JAMstack",
    color: "from-[#00C7B7] to-[#00AD9F]",
    icon: "◆",
  },
  {
    id: "firebase",
    name: "Firebase",
    description: "Ideal for full-stack Firebase apps",
    color: "from-[#FFCA28] to-[#FFA000]",
    icon: "🔥",
  },
];

interface ProviderSelectProps {
  selected: string | null;
  onSelect: (provider: "vercel" | "netlify" | "firebase") => void;
  disabled?: boolean;
}

const ProviderSelect = ({
  selected,
  onSelect,
  disabled,
}: ProviderSelectProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {providers.map((provider, index) => (
        <motion.button
          key={provider.id}
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => !disabled && onSelect(provider.id)}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 p-6 transition-all",
            selected === provider.id
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-border hover:border-primary/50 hover:bg-secondary/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {/* ---- selected badge ---- */}
          {selected === provider.id ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Check className="h-4 w-4" />
            </motion.div>
          ) : null}

          {/* ---- provider icon ---- */}
          <div
            aria-hidden="true"
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br text-3xl text-primary-foreground",
              provider.color
            )}
          >
            {provider.icon}
          </div>

          <h3 className="mb-1 font-semibold">{provider.name}</h3>
          <p className="text-center text-xs text-muted-foreground">
            {provider.description}
          </p>
        </motion.button>
      ))}
    </div>
  );
};

export default ProviderSelect;
