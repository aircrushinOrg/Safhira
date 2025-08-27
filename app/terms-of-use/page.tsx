import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  CheckCircle,
  Shield,
  Users,
  BookOpen,
  Mail,
  Calendar,
  XCircle
} from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-pink-500 rounded-full flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-pink-600 bg-clip-text text-transparent">
              Terms of Use
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using Safhira. By accessing our platform, you agree to be bound by these terms and conditions.
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-200">
              <Scale size={12} className="mr-1" />
              Legal
            </Badge>
            <Badge variant="secondary" className="bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-200">
              <Shield size={12} className="mr-1" />
              Protected
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

        {/* Agreement */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <CheckCircle className="text-green-600" size={24} />
            <span>Agreement to Terms</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            By accessing and using the Safhira platform, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our service.
          </p>
          <div className="bg-teal-50 dark:bg-teal-950/30 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
            <p className="text-teal-800 dark:text-teal-200 text-sm">
              <strong>Important:</strong> These terms constitute a legally binding agreement between you and the Safhira platform 
              (operated by Monash University Malaysia FIT5120 project team).
            </p>
          </div>
        </Card>

        {/* Platform Description */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <BookOpen className="text-blue-600" size={24} />
            <span>Platform Description</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Safhira is an educational platform designed to provide comprehensive, evidence-based information about 
            sexually transmitted infections (STIs) and reproductive health, specifically tailored for Malaysian teenagers.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-teal-600 dark:text-teal-400 mb-2">Educational Content</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scientifically accurate information about STI prevention, symptoms, and treatment options.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-pink-600 dark:text-pink-400 mb-2">Interactive Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes, AI chat support, and personalized learning modules.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Resource Directory</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Information about healthcare facilities and support services in Malaysia.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Privacy Focus</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Anonymous access with no personal data collection or storage.</p>
            </div>
          </div>
        </Card>

        {/* Acceptable Use */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Acceptable Use</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You agree to use Safhira only for lawful purposes and in accordance with these terms:</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Permitted Uses</span>
              </h3>
              <div className="space-y-2 ml-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Educational learning about reproductive health and STI prevention</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taking quizzes and assessments for self-education</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Using AI chat for health education questions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Accessing resource directories and clinic information</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center space-x-2">
                <XCircle size={16} />
                <span>Prohibited Uses</span>
              </h3>
              <div className="space-y-2 ml-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Attempting to reverse engineer or hack the platform</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sharing or distributing harmful, illegal, or inappropriate content</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Using the platform for commercial purposes without permission</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Attempting to collect personal information from other users</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Educational Disclaimer */}
        <Card className="p-6 mb-8 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-300" size={24} />
            <span>Educational Disclaimer</span>
          </h2>
          <div className="space-y-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Not Medical Advice:</strong> Information provided on Safhira is for educational purposes only 
              and should not be considered as professional medical advice, diagnosis, or treatment.
            </p>
            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Always Consult Healthcare Professionals</h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Seek professional medical advice for health concerns</li>
                <li>• Get tested by qualified healthcare providers</li>
                <li>• Follow treatment plans prescribed by licensed doctors</li>
                <li>• Contact emergency services for urgent health situations</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Age Requirements */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Users className="text-purple-600" size={24} />
            <span>Age Requirements</span>
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Safhira is designed for educational use by individuals of all ages, with content specifically 
              tailored for Malaysian teenagers and young adults.
            </p>
            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Parental Guidance</h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                We encourage parental involvement in health education. Parents and guardians are welcome to 
                review our content and use it as a tool for health discussions with their teenagers.
              </p>
            </div>
          </div>
        </Card>

        {/* Intellectual Property */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              All content on Safhira, including text, graphics, logos, and software, is the property of 
              Monash University Malaysia or its content suppliers and is protected by intellectual property laws.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-teal-600 dark:text-teal-400 mb-2">Educational Use</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Content may be used for personal, non-commercial educational purposes.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-pink-600 dark:text-pink-400 mb-2">Attribution Required</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Any use of our content should include proper attribution to Safhira and Monash University Malaysia.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Limitation of Liability */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Safhira is provided &quot;as is&quot; without warranties of any kind. We make no guarantees about the 
              completeness, accuracy, or reliability of the information provided.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Disclaimer of Warranties</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• We do not warrant that the service will be uninterrupted or error-free</li>
                <li>• Information accuracy may vary and should be verified with healthcare professionals</li>
                <li>• We are not liable for decisions made based on platform content</li>
                <li>• Emergency situations require immediate professional medical attention</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Privacy and Data Protection */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Shield className="text-green-600" size={24} />
            <span>Privacy and Data Protection</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your privacy is paramount to us. Our privacy practices are detailed in our Privacy Policy, which is 
            incorporated into these terms by reference.
          </p>
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Key Privacy Commitments</h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• No personal data collection or storage</li>
              <li>• Anonymous platform usage</li>
              <li>• SSL encryption for all communications</li>
              <li>• No tracking or behavioral monitoring</li>
            </ul>
          </div>
        </Card>

        {/* Modifications */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Modifications to Terms</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We reserve the right to modify these terms at any time. Changes will be posted on this page with 
            an updated revision date. Continued use of the platform after changes constitutes acceptance of the new terms.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Notification:</strong> Significant changes to these terms will be prominently displayed 
              on our platform to ensure users are aware of any modifications.
            </p>
          </div>
        </Card>

        {/* Governing Law */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Scale className="text-purple-600" size={24} />
            <span>Governing Law</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            These terms are governed by the laws of Malaysia. Any disputes arising from the use of this platform 
            will be subject to the jurisdiction of Malaysian courts.
          </p>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 bg-gradient-to-r from-teal-50 to-pink-50 dark:from-teal-950/30 dark:to-pink-950/30 border-teal-200 dark:border-teal-800">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Mail className="text-teal-600 dark:text-teal-400" size={24} />
            <span>Contact Information</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            If you have any questions about these Terms of Use, please contact us:
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-teal-600 dark:text-teal-400">Email</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">hfuu0019@student.monash.edu</p>
              </div>
              <div>
                <p className="font-semibold text-pink-600 dark:text-pink-400">Institution</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Monash University Malaysia</p>
              </div>
              <div>
                <p className="font-semibold text-purple-600 dark:text-purple-400">Project</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">FIT5120 - Industry Experience Studio Project</p>
              </div>
              <div>
                <p className="font-semibold text-blue-600 dark:text-blue-400">Response Time</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Within 48 hours during business days</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Acknowledgment */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-green-200 dark:border-green-800">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <CheckCircle className="text-green-600" size={24} />
            <span>Acknowledgment</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            By using Safhira, you acknowledge that you have read these Terms of Use, understand them, and agree 
            to be bound by their terms and conditions. You also acknowledge that these terms constitute the 
            complete and exclusive agreement between you and Safhira regarding your use of the platform.
          </p>
        </Card>
      </div>
    </div>
  );
}
