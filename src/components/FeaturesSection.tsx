import {
  Code,
  Users,
  Zap,
  GitBranch,
  MessageSquare,
  Play,
  FileText,
  Settings,
  Shield
} from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Code,
      title: "Multi-Language Support",
      description: "Support for JavaScript, Python, TypeScript, Java, C++, and 20+ programming languages with syntax highlighting.",
      color: "text-blue-500"
    },
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description: "See your teammates' cursors and changes in real-time. Perfect for pair programming and code reviews.",
      color: "text-green-500"
    },
    {
      icon: Play,
      title: "Instant Execution",
      description: "Run your code directly in the browser with our powerful execution environment. Debug and test instantly.",
      color: "text-purple-500"
    },
    {
      icon: GitBranch,
      title: "Version Control",
      description: "Built-in Git integration with branch management, commit history, and seamless GitHub synchronization.",
      color: "text-orange-500"
    },
    {
      icon: MessageSquare,
      title: "Integrated Chat",
      description: "Communicate with your team without leaving the editor. Share ideas and discuss code changes in context.",
      color: "text-pink-500"
    },
    {
      icon: Settings,
      title: "Customizable Environment",
      description: "Personalize your coding experience with themes, extensions, and configurable development environments.",
      color: "text-indigo-500"
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powerful{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for seamless collaborative coding in one powerful platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-large transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4">
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};