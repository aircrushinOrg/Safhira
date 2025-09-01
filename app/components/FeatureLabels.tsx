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
    },
    {
      icon: Book,
      text: "Science-Based",
    },
    {
      icon: Users,
      text: "Teen-Friendly",
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
          className={`flex items-center space-x-2 rounded-full px-4 py-2 text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30`}
        >
          <feature.icon size={16} />
          <span className="text-xs md:text-sm">{feature.text}</span>
        </li>
      ))}
    </motion.ul>
  );
}