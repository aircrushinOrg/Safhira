import { motion } from 'framer-motion';
import { Shield, Heart, Book, Users } from 'lucide-react';

interface FeatureLabelProps {
  variants: any;
}

export function FeatureLabels({ variants }: FeatureLabelProps) {
  const features = [
    {
      icon: Shield,
      text: "Private & Safe",
      color: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30"
    },
    {
      icon: Heart,
      text: "Stigma-Free",
      color: "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30"
    },
    {
      icon: Book,
      text: "Science-Based",
      color: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30"
    },
    {
      icon: Users,
      text: "Teen-Friendly",
      color: "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30"
    }
  ];

  return (
    <motion.ul 
      className="flex flex-wrap gap-2 justify-center lg:justify-start"
      variants={variants}
    >
      {features.map((feature, index) => (
        <li 
          key={feature.text}
          className={`flex items-center space-x-2 rounded-full px-4 py-2 ${feature.color}`}
        >
          <feature.icon size={16} />
          <span className="text-xs md:text-sm">{feature.text}</span>
        </li>
      ))}
    </motion.ul>
  );
}