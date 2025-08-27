import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Eye, 
  Lock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Mail,
  Calendar
} from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-pink-500 rounded-full flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-pink-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            At Safhira, your privacy and security are our top priorities. Learn how we protect your information while providing safe, educational content about reproductive health.
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-200">
              <Lock size={12} className="mr-1" />
              Secure
            </Badge>
            <Badge variant="secondary" className="bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-200">
              <Eye size={12} className="mr-1" />
              Transparent
            </Badge>
          </div>
        </div>

        {/* Last Updated */}
        <Card className="p-4 mb-8 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Calendar className="text-blue-600 dark:text-blue-300" size={20} />
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-200">Last Updated</p>
              <p className="text-blue-700 dark:text-blue-300 text-sm">January 2025</p>
            </div>
          </div>
        </Card>

        {/* Core Principles */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <CheckCircle className="text-green-600" size={24} />
            <span>Our Core Privacy Principles</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-teal-600 dark:text-teal-400 mb-2">No Personal Data Storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">We do not collect, store, or retain any personal information about our users.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-pink-600 dark:text-pink-400 mb-2">Anonymous Learning</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">All interactions are completely anonymous and cannot be traced back to individuals.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Local Processing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quiz results and learning progress are processed locally in your browser.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">SSL Encryption</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">All communications are encrypted using industry-standard SSL protocols.</p>
            </div>
          </div>
        </Card>

        {/* Information We Don't Collect */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Information We Don&apos;t Collect</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Personal Identifiers</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Names, email addresses, phone numbers, or any other personal identifiers.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Health Information</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Any personal health data, medical history, or individual health concerns.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Location Data</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Precise location information or tracking data.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Chat Histories</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">AI chat conversations are not stored or logged.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Information */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Limited Technical Information</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We may collect minimal, non-personal technical information solely for website functionality and security:
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Browser Type</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">To ensure compatibility and optimal user experience.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">General Location (Country/Region)</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">To provide relevant health resources and comply with local regulations.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Session Information</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Temporary data to maintain website functionality during your visit.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Third-Party Services */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We use minimal third-party services, all of which respect user privacy:
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-teal-600 dark:text-teal-400">AI Chat Service</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conversations are processed anonymously and are not stored by our AI provider.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-pink-600 dark:text-pink-400">Website Hosting</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vercel hosting with standard security measures and no personal data storage.
              </p>
            </div>
          </div>
        </Card>

        {/* Data Security */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Data Security</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold">Encryption</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">All data transmission is encrypted using SSL/TLS protocols.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Lock className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold">Secure Infrastructure</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Hosted on secure, regularly updated servers with industry-standard protections.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold">Anonymous by Design</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Our architecture is designed to prevent any personal data collection.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Your Rights */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Since we don&apos;t collect personal data, traditional data rights don&apos;t apply. However, you have:
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm">The right to use our service completely anonymously</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm">The right to clear your browser data at any time</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm">The right to contact us with privacy concerns</span>
            </div>
          </div>
        </Card>

        {/* Changes to Policy */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
          <p className="text-gray-600 dark:text-gray-400">
            We may update this privacy policy occasionally to reflect changes in our practices or legal requirements. 
            Any changes will be posted on this page with an updated revision date. We encourage you to review this 
            policy periodically.
          </p>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 bg-gradient-to-r from-teal-50 to-pink-50 dark:from-teal-950/30 dark:to-pink-950/30 border-teal-200 dark:border-teal-800">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Mail className="text-teal-600 dark:text-teal-400" size={24} />
            <span>Contact Us</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            If you have any questions about this privacy policy or our privacy practices, please contact us:
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p className="font-semibold text-teal-600 dark:text-teal-400">Email</p>
            <p className="text-gray-600 dark:text-gray-400">hfuu0019@student.monash.edu</p>
            <p className="font-semibold text-pink-600 dark:text-pink-400 mt-3">Institution</p>
            <p className="text-gray-600 dark:text-gray-400">Monash University Malaysia - FIT5120 Project</p>
          </div>
        </Card>

        {/* Important Notice */}
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-300 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Educational Purpose</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                This platform is designed for educational purposes only. Information provided is not a substitute 
                for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
