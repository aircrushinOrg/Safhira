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
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">S</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Safhira</h3>
                <p className="text-xs text-gray-300 dark:text-gray-400">Modern Health Education</p>
              </div>
            </div>
            <p className="text-gray-300 dark:text-gray-400 text-sm mb-4">
              A safe and stigma-free learning platform for understanding 
              reproductive health for Malaysian teens.
            </p>
            <div className="flex space-x-2">
              <Badge variant="secondary" className="bg-green-800 dark:bg-green-900 text-green-100 dark:text-green-200">
                <Shield size={12} className="mr-1" />
                Private
              </Badge>
              <Badge variant="secondary" className="bg-blue-800 dark:bg-blue-900 text-blue-100 dark:text-blue-200">
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
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">STI Basics</a></li>
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Prevention</a></li>
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Testing & Treatment</a></li>
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Myths vs Facts</a></li>
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Interactive Quiz</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center space-x-2">
              <Users size={16} />
              <span>Support</span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Private AI Chat</a></li>
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Help Resources</a></li>
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Nearest Clinics</a></li>
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Emergency Hotlines</a></li>
              <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">FAQ</a></li>
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
                <Globe size={14} className="text-gray-400 dark:text-gray-500" />
                <span className="text-gray-300 dark:text-gray-400">www.safhira.my</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} className="text-gray-400 dark:text-gray-500" />
                <span className="text-gray-300 dark:text-gray-400">info@safhira.my</span>
              </div>
              <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-3 mt-4">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Developed in collaboration with:</p>
                <ul className="text-xs text-gray-300 dark:text-gray-400 space-y-1">
                  <li>• Malaysian Ministry of Health</li>
                  <li>• University of Malaya</li>
                  <li>• Malaysian AIDS Foundation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="p-4 mb-6 bg-yellow-900/50 dark:bg-yellow-900/30 border-yellow-600 dark:border-yellow-700">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-400 dark:text-yellow-300 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-yellow-100 dark:text-yellow-200 mb-2">Important Disclaimer</h4>
              <p className="text-yellow-200 dark:text-yellow-300 text-sm">
                Information on this website is for educational purposes only and is not a substitute 
                for professional medical advice. Please consult a doctor for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </Card>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 dark:border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400 dark:text-gray-500">
              © 2024 Safhira. All rights reserved. Made with ❤️ for Malaysian teens.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Data Security</a>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="flex justify-center items-center space-x-4 text-xs text-gray-500 dark:text-gray-600">
              <div className="flex items-center space-x-1">
                <Shield size={12} />
                <span>SSL Encrypted</span>
              </div>
              <div>•</div>
              <div className="flex items-center space-x-1">
                <Heart size={12} />
                <span>No Data Stored</span>
              </div>
              <div>•</div>
              <div className="flex items-center space-x-1">
                <Users size={12} />
                <span>Anonymous Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}