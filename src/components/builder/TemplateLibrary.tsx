import { useState } from "react";
import { X, Layout, Briefcase, BookOpen, Rocket, User, ShoppingBag, Sparkles } from "lucide-react";

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  prompt: string;
  preview: string;
}

const templates: Template[] = [
  {
    id: "portfolio",
    name: "Portfolio Website",
    description: "Personal portfolio with projects, skills & contact",
    icon: <User size={20} />,
    category: "Personal",
    preview: "🎨",
    prompt: `Create a modern, professional portfolio website with the following sections:
1. Hero section with name, title, and a brief intro with a gradient background
2. About Me section with a professional bio and skills grid (HTML, CSS, JS, React, Node.js, Python)
3. Projects section with 6 project cards in a responsive grid - each card has an image placeholder, title, description, and tech tags
4. Experience timeline section
5. Contact section with a working contact form (name, email, message fields)
6. Smooth scroll navigation, dark theme, modern glassmorphism cards, subtle animations on scroll
Use Tailwind CSS, Google Fonts (Inter), and Font Awesome icons. Make it fully responsive and visually stunning.`,
  },
  {
    id: "landing",
    name: "Landing Page",
    description: "High-converting product landing page",
    icon: <Rocket size={20} />,
    category: "Business",
    preview: "🚀",
    prompt: `Create a high-converting SaaS landing page with these sections:
1. Hero section with headline "Build Faster with AI", subtext, CTA button, and a mockup image placeholder
2. Trusted by section with 6 company logo placeholders
3. Features section with 6 feature cards (icons, titles, descriptions) in a grid
4. How it works - 3 step process with icons and connecting lines
5. Pricing section with 3 tiers (Free, Pro, Enterprise) with feature lists and CTA buttons
6. Testimonials carousel with 3 customer reviews
7. FAQ accordion section
8. CTA section with email signup
9. Footer with links
Use Tailwind CSS, smooth animations, gradient accents, and glassmorphism. Make it modern, clean, and fully responsive.`,
  },
  {
    id: "blog",
    name: "Blog Website",
    description: "Clean blog with articles and categories",
    icon: <BookOpen size={20} />,
    category: "Content",
    preview: "📝",
    prompt: `Create a modern blog website with:
1. Header with logo, navigation (Home, Articles, Categories, About), and search bar
2. Hero section with featured article (large card with image, title, excerpt, author, date)
3. Articles grid with 6 blog post cards - each with image placeholder, category tag, title, excerpt, author avatar, read time
4. Sidebar with categories list, popular posts, newsletter signup
5. Footer with about, quick links, social media icons
Use Tailwind CSS, clean typography (Inter + serif for articles), subtle shadows, and a white/light theme with accent colors. Make it responsive with a beautiful reading experience.`,
  },
  {
    id: "business",
    name: "Business Website",
    description: "Professional company website",
    icon: <Briefcase size={20} />,
    category: "Business",
    preview: "💼",
    prompt: `Create a professional business/corporate website with:
1. Navigation bar with company logo, links (Home, Services, About, Team, Contact), and CTA button
2. Hero section with headline, description, two CTA buttons, and background pattern
3. Services section with 6 service cards (icon, title, description)
4. About section with company story, mission, stats counters (10+ years, 500+ clients, 50+ team)
5. Team section with 4 team member cards (photo placeholder, name, role, social links)
6. Client logos section
7. Testimonials section
8. Contact section with form and map placeholder
9. Footer with company info, links, newsletter signup
Use Tailwind CSS, professional blue/navy color scheme, clean layout, subtle animations. Fully responsive.`,
  },
  {
    id: "ecommerce",
    name: "E-Commerce Store",
    description: "Online store with products and cart",
    icon: <ShoppingBag size={20} />,
    category: "Commerce",
    preview: "🛒",
    prompt: `Create a modern e-commerce store landing page with:
1. Header with logo, search bar, cart icon with badge, user icon, and navigation
2. Hero banner with promotional slider placeholder
3. Categories section with 6 category cards (image, name)
4. Featured products grid with 8 product cards - each with image placeholder, name, price, rating stars, add to cart button, wishlist icon
5. Special offers banner section
6. New arrivals section with 4 products
7. Newsletter signup section
8. Footer with shop links, customer service, payment icons, social media
Use Tailwind CSS, clean white theme with accent color, hover effects on products, responsive grid. Add a floating cart button on mobile.`,
  },
  {
    id: "app-landing",
    name: "App Landing Page",
    description: "Mobile app download page",
    icon: <Layout size={20} />,
    category: "Technology",
    preview: "📱",
    prompt: `Create a stunning mobile app landing page with:
1. Hero section with app name, tagline, description, App Store + Google Play download buttons, and a phone mockup placeholder
2. Features section with 6 features in alternating layout (text left/right, phone mockup)
3. Screenshots section with a horizontal scrolling gallery of 5 app screenshot placeholders
4. Stats section (1M+ downloads, 4.9 rating, 50K+ reviews)
5. How it works - 3 steps with phone illustrations
6. Testimonials from app users
7. Download CTA section with both store buttons
8. Footer
Use Tailwind CSS, vibrant gradient backgrounds, smooth animations, glassmorphism cards. Dark theme with colorful accents. Fully responsive.`,
  },
];

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

export function TemplateLibrary({ open, onClose, onSelect }: TemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (!open) return null;

  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))];
  const filtered = selectedCategory === "All" ? templates : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h2 className="text-lg font-bold font-display text-foreground">Templates</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(template => (
              <button
                key={template.id}
                onClick={() => { onSelect(template.prompt); onClose(); }}
                className="group flex flex-col gap-3 p-4 rounded-xl border border-border bg-background hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 text-left active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{template.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{template.category}</span>
                  <span className="text-[10px] text-muted-foreground/60 ml-auto">Click to generate →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
