import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Heart, 
  Shield, 
  Mail, 
  Globe, 
  Users, 
  BookOpen,
  AlertTriangle
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-t from-pink-50/50 via-gray-50 to-teal-50/50 dark:from-pink-950/30 dark:via-gray-900 dark:to-teal-950/30 text-gray-800 dark:text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">S</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Safhira</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Modern Health Education</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              A safe and stigma-free learning platform for understanding 
              reproductive health for Malaysian teens.
            </p>
            <div className="flex space-x-2">
              <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-200">
                <Shield size={12} className="mr-1" />
                Private
              </Badge>
              <Badge variant="secondary" className="bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-200">
                <Heart size={12} className="mr-1" />
                Safe
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center space-x-2">
              <BookOpen size={16} />
              <span>Learning</span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/stis" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-white transition-colors">STI Basics</a></li>
              <li><a href="/stis/prevention" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-white transition-colors">Prevention</a></li>
              <li><a href="/?section=basics" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-white transition-colors">Testing & Treatment</a></li>
              <li><a href="/?section=myths" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-white transition-colors">Myths vs Facts</a></li>
              <li><a href="/?section=quiz" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-white transition-colors">Interactive Quiz</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center space-x-2">
              <Users size={16} />
              <span>Support</span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/chat" className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-white transition-colors">Private AI Chat</a></li>
              <li><a href="/stis" className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-white transition-colors">Help Resources</a></li>
              <li><a href="/stis/prevalence" className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-white transition-colors">Prevalence Data</a></li>
              <li><a href="/stis/prevention" className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-white transition-colors">Prevention Guide</a></li>
              <li><a href="/?section=quiz" className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-white transition-colors">Knowledge Quiz</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center space-x-2">
              <Mail size={16} />
              <span>Contact Us</span>
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Globe size={14} className="text-gray-500 dark:text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">www.safhira.vercel.app</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} className="text-gray-500 dark:text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">hfuu0019@student.monash.edu</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Developed in collaboration with:</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Malaysian Ministry of Health</li>
                  <li>• Monash University Malaysia</li>
                  <li>• Malaysian AIDS Foundation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-300 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Disclaimer</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Information on this website is for educational purposes only and is not a substitute 
                for professional medical advice. Please consult a doctor for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </Card>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 dark:border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500 dark:text-gray-500">
              © 2025 Safhira. All rights reserved. Made with ❤️ from FIT5120-TM01
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="/privacy-policy" className="text-gray-500 dark:text-gray-500 hover:text-teal-600 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms-of-use" className="text-gray-500 dark:text-gray-500 hover:text-teal-600 dark:hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="text-gray-500 dark:text-gray-500 hover:text-teal-600 dark:hover:text-white transition-colors">Data Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}