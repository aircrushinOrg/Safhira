import { Button } from './ui/button';
import { Card } from './ui/card';
import { Shield, Heart, Book, Users } from 'lucide-react';

export function Hero() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Welcome to <span className="text-teal-600 dark:text-teal-400">Safhira</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            A safe and stigma-free learning platform for understanding reproductive health. 
            Learn with confidence, grow with knowledge.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
              <Shield size={20} />
              <span>Private & Safe</span>
            </div>
            <div className="flex items-center space-x-2 text-pink-600 dark:text-pink-400">
              <Heart size={20} />
              <span>Stigma-Free</span>
            </div>
            <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
              <Book size={20} />
              <span>Science-Based</span>
            </div>
            <div className="flex items-center space-x-2 text-pink-600 dark:text-pink-400">
              <Users size={20} />
              <span>Teen-Friendly</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-teal-200 dark:border-teal-700">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-teal-600 dark:text-teal-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Privacy Guaranteed</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                No personal data stored. All learning is anonymous and secure.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-pink-200 dark:border-pink-700">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Book className="text-pink-600 dark:text-pink-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Self-Paced Learning</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Learn at your own pace with modules designed to be easy to understand.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-teal-200 dark:border-teal-700">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-teal-600 dark:text-teal-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Chat with understanding AI for immediate and private answers.
              </p>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            🏥 Supported by Malaysian health professionals | 🛡️ No data stored
          </p>
        </div>
      </div>
    </section>
  );
}