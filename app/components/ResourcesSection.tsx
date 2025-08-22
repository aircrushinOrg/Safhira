import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ExternalLink, 
  Phone, 
  MapPin, 
  Clock, 
  Heart, 
  Shield,
  BookOpen,
  Users,
  AlertCircle
} from 'lucide-react';

export function ResourcesSection() {
  const resources = [
    {
      title: 'Malaysian Health Clinics',
      description: 'List of government health clinics providing STI testing and treatment',
      type: 'Healthcare',
      icon: MapPin,
      color: 'green',
      items: [
        'KL Reproductive Health Clinic',
        'Kuala Lumpur Hospital',
        'Petaling Jaya Health Clinic'
      ]
    },
    {
      title: 'Emergency Hotlines',
      description: 'Call immediately if you need urgent help or advice',
      type: 'Emergency',
      icon: Phone,
      color: 'red',
      items: [
        'Befrienders: 03-7956 8145',
        'Women\'s Aid Organisation: 03-3000 8858',
        'Talian Kasih: 15999'
      ]
    },
    {
      title: 'NGOs & Support',
      description: 'Organizations that help with health education and support',
      type: 'Support',
      icon: Users,
      color: 'blue',
      items: [
        'Malaysian AIDS Foundation',
        'Reproductive Rights Advocacy Alliance Malaysia',
        'Pink Triangle Foundation'
      ]
    },
    {
      title: 'Reading Materials',
      description: 'Additional reliable information sources',
      type: 'Education',
      icon: BookOpen,
      color: 'purple',
      items: [
        'WHO Guidelines on STI',
        'CDC Sexual Health Resources',
        'Malaysian Ministry of Health Guidelines'
      ]
    }
  ];

  const emergencyInfo = {
    title: 'Important Information',
    items: [
      {
        icon: AlertCircle,
        title: 'If you experience severe symptoms',
        description: 'Severe pain, high fever, or bleeding - go to hospital immediately',
        action: 'Nearest Hospital'
      },
      {
        icon: Shield,
        title: 'After unprotected exposure',
        description: 'PEP (Post-Exposure Prophylaxis) must be started within 72 hours',
        action: 'Contact Doctor'
      },
      {
        icon: Heart,
        title: 'Emotional support',
        description: 'Don\'t face this alone. Get support from counselors or friends',
        action: 'Seek Help'
      }
    ]
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Resources & Support
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Contact information and reliable resources to get professional help 
            and additional support.
          </p>
        </div>

        {/* Emergency Information */}
        <Card className="p-6 mb-12 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={24} />
            <span>{emergencyInfo.title}</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {emergencyInfo.items.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <item.icon className="text-red-500 flex-shrink-0 mt-1" size={20} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">{item.title}</h4>
                    <p className="text-gray-600 text-xs mb-3">{item.description}</p>
                    <Button size="sm" variant="outline" className="text-xs">
                      {item.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Resource Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {resources.map((resource, index) => (
            <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${resource.color}-100`}>
                  <resource.icon className={`text-${resource.color}-600`} size={24} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {resource.type}
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
              
              <div className="space-y-2 mb-6">
                {resource.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-2 text-sm">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" size="sm" className="w-full group">
                More Information
                <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          ))}
        </div>

        {/* Operating Hours Info */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center space-x-2">
              <Clock className="text-blue-500" size={20} />
              <span>Clinic Operating Hours</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Government Health Clinics</h4>
                <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Saturday: 8:00 AM - 1:00 PM</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Government Hospitals</h4>
                <p className="text-gray-600">24 Hours (Emergency)</p>
                <p className="text-gray-600">Clinics: 8:00 AM - 5:00 PM</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Private Clinics</h4>
                <p className="text-gray-600">According to clinic schedule</p>
                <p className="text-gray-600">Usually 9:00 AM - 9:00 PM</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Reminder */}
        <div className="text-center mt-8">
          <Card className="p-4 bg-green-50 border-green-200 inline-block">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <Shield size={16} />
              <span>Reminder: All medical information is confidential and protected</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}