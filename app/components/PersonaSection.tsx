import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageCircle, Heart, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function PersonaSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-pink-50 to-teal-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Learn with Jun Kang
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Meet Chong Jun Kang, a 19-year-old Chinese Malaysian university student in his first serious relationship. 
            He&apos;ll guide your learning journey with relatable experiences and insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">JK</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Chong Jun Kang</h3>
                  <Badge variant="secondary" className="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200">19 years old</Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Business Administration student at Taylor&apos;s University in Shah Alam. Eldest of three siblings, 
                  in his first serious relationship with Xin Yi for 3 months. Seeks reliable health information.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">First Relationship</Badge>
                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">University Student</Badge>
                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Responsible Eldest</Badge>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-teal-50 dark:from-gray-700 dark:to-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <MessageCircle size={16} className="text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jun Kang says:</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                &quot;At first I felt paiseh (shy) to ask about these things, especially with my traditional family background. 
                But after my mum&apos;s vague warnings about &apos;diseases&apos;, I realized I need proper knowledge to protect 
                myself and Xin Yi. Safhira gives me the facts without judgment.&quot;
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-1">4+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Modules Completed</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">85%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Quiz Score</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">12</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Chat Questions</div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="text-yellow-500 dark:text-yellow-400" size={20} />
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Jun Kang&apos;s Learning Journey</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 dark:bg-teal-400 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">STI Basics and Prevention</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 dark:bg-teal-400 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Health Testing and Treatment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-pink-500 dark:bg-pink-400 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Communication with Partner</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Myths and Facts</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-100 to-teal-100 dark:from-pink-900/30 dark:to-teal-900/30 border-pink-200 dark:border-pink-800">
              <div className="flex items-center space-x-2 mb-3">
                <Heart className="text-red-500 dark:text-red-400" size={20} />
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Jun Kang&apos;s Tip</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                &quot;Don&apos;t feel malu (embarrassed) to learn about these things! Even though my family 
                rarely discussed it openly, sexual health is important for our future. The AI chat 
                here helped me ask questions I was too shy to ask anyone else.&quot;
              </p>
              <Button variant="outline" size="sm" className="text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30">
                Chat with Jun Kang AI
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}