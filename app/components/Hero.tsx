import { Button } from './ui/button';
import { Card } from './ui/card';
import { Shield, Heart, Book, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const featureVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            variants={itemVariants}
          >
            Welcome to <span className="text-teal-600 dark:text-teal-400">Safhira</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6"
            variants={itemVariants}
          >
            A safe and stigma-free learning platform for understanding reproductive health. 
            Learn with confidence, grow with knowledge.
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-8"
            variants={containerVariants}
          >
            <motion.div 
              className="flex items-center space-x-2 text-teal-600 dark:text-teal-400"
              variants={featureVariants}
              whileHover={{ scale: 1.05 }}
            >
              <Shield size={20} />
              <span>Private & Safe</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 text-pink-600 dark:text-pink-400"
              variants={featureVariants}
              whileHover={{ scale: 1.05 }}
            >
              <Heart size={20} />
              <span>Stigma-Free</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 text-teal-600 dark:text-teal-400"
              variants={featureVariants}
              whileHover={{ scale: 1.05 }}
            >
              <Book size={20} />
              <span>Science-Based</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 text-pink-600 dark:text-pink-400"
              variants={featureVariants}
              whileHover={{ scale: 1.05 }}
            >
              <Users size={20} />
              <span>Teen-Friendly</span>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-teal-200 dark:border-teal-700 h-full">
              <div className="text-center">
                <motion.div 
                  className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                >
                  <Shield className="text-teal-600 dark:text-teal-400" size={24} />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Privacy Guaranteed</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  No personal data stored. All learning is anonymous and secure.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-pink-200 dark:border-pink-700 h-full">
              <div className="text-center">
                <motion.div 
                  className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                >
                  <Book className="text-pink-600 dark:text-pink-400" size={24} />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Self-Paced Learning</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Learn at your own pace with modules designed to be easy to understand.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-teal-200 dark:border-teal-700 h-full">
              <div className="text-center">
                <motion.div 
                  className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                >
                  <Heart className="text-teal-600 dark:text-teal-400" size={24} />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">24/7 Support</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Chat with understanding AI for immediate and private answers.
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            🏥 Supported by Malaysian health professionals | 🛡️ No data stored
          </p>
        </motion.div>
      </div>
    </section>
  );
}