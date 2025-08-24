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
    <footer className="bg-secondary text-secondary-foreground py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="font-bold text-primary-foreground">S</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Safhira</h3>
                <p className="text-xs text-muted-foreground">Modern Health Education</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              A safe and stigma-free learning platform for understanding 
              reproductive health for Malaysian teens.
            </p>
            <div className="flex space-x-2">
              <Badge variant="default">
                <Shield size={12} className="mr-1" />
                Private
              </Badge>
              <Badge variant="default">
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
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">STI Basics</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Prevention</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Testing & Treatment</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Myths vs Facts</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Interactive Quiz</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center space-x-2">
              <Users size={16} />
              <span>Support</span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Private AI Chat</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Resources</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Nearest Clinics</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Emergency Hotlines</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
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
                <Globe size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">www.safhira.my</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">info@safhira.my</span>
              </div>
              <div className="bg-background rounded-lg p-3 mt-4">
                <p className="text-xs text-muted-foreground mb-2">Developed in collaboration with:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Malaysian Ministry of Health</li>
                  <li>• University of Malaya</li>
                  <li>• Malaysian AIDS Foundation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="p-4 mb-6 bg-destructive/10 border-destructive">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-destructive flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-destructive-foreground mb-2">Important Disclaimer</h4>
              <p className="text-destructive-foreground text-sm">
                Information on this website is for educational purposes only and is not a substitute 
                for professional medical advice. Please consult a doctor for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </Card>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 Safhira. All rights reserved. Made with ❤️ for Malaysian teens.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Use</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Data Security</a>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="flex justify-center items-center space-x-4 text-xs text-muted-foreground">
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