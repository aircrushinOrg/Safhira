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
import { useState } from 'react';

export function ResourcesSection() {
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const findNearestHospital = async () => {
    setIsLocationLoading(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
      }

      // Get user's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Open Google Maps with search for hospitals/clinics near the user's location
      const googleMapsUrl = `https://www.google.com/maps/search/hospital+clinic+medical+center/@${latitude},${longitude},15z`;
      
      // Open in new tab
      window.open(googleMapsUrl, '_blank');
      
    } catch (error) {
      console.error('Error getting location:', error);
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied. Please enable location services and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out.');
            break;
          default:
            alert('An unknown error occurred while retrieving location.');
            break;
        }
      } else {
        alert('Failed to get your location. Please try again.');
      }
      
      // Fallback: Open Google Maps with general hospital search in Malaysia
      const fallbackUrl = 'https://www.google.com/maps/search/hospital+clinic+kuala+lumpur+malaysia';
      window.open(fallbackUrl, '_blank');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const contactDoctor = () => {
    setShowContactModal(true);
  };

  const seekHelp = () => {
    setShowSupportModal(true);
  };

  const callNumber = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  const openWhatsApp = (number: string, message: string) => {
    const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const doctorContacts = [
    {
      name: 'KL General Hospital Emergency',
      phone: '03-2615-5555',
      description: '24/7 Emergency services',
      type: 'Emergency'
    },
    {
      name: 'University Malaya Medical Centre',
      phone: '03-7949-4422',
      description: 'Specialist consultations available',
      type: 'Hospital'
    },
    {
      name: 'DoctorOnCall Hotline',
      phone: '03-4141-3818',
      description: 'Free medical advice hotline',
      type: 'Hotline'
    },
    {
      name: 'MySejahtera Telehealth',
      phone: 'Via MySejahtera App',
      description: 'Government telehealth service',
      type: 'Online'
    }
  ];

  const supportContacts = [
    {
      name: 'Befrienders KL',
      phone: '03-7956-8145',
      description: '24/7 emotional support & suicide prevention',
      whatsapp: '60127962423',
      type: 'Crisis Support'
    },
    {
      name: 'Talian Kasih',
      phone: '15999',
      description: 'Government counseling helpline',
      type: 'Counseling'
    },
    {
      name: 'Women\'s Aid Organisation',
      phone: '03-3000-8858',
      description: 'Support for women in crisis',
      whatsapp: '60162377769',
      type: 'Women Support'
    },
    {
      name: 'Malaysian Mental Health Association',
      phone: '03-2780-6803',
      description: 'Mental health support and counseling',
      type: 'Mental Health'
    }
  ];

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
        action: 'Nearest Hospital',
        onClick: findNearestHospital
      },
      {
        icon: Shield,
        title: 'After unprotected exposure',
        description: 'PEP (Post-Exposure Prophylaxis) must be started within 72 hours',
        action: 'Contact Doctor',
        onClick: contactDoctor
      },
      {
        icon: Heart,
        title: 'Emotional support',
        description: 'Don\'t face this alone. Get support from counselors or friends',
        action: 'Seek Help',
        onClick: seekHelp
      }
    ]
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Resources & Support
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Contact information and reliable resources to get professional help 
            and additional support.
          </p>
        </div>

        {/* Emergency Information */}
        <Card className="p-6 mb-12 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-red-200 dark:border-red-800">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center space-x-2">
            <AlertCircle className="text-red-500 dark:text-red-400" size={24} />
            <span>{emergencyInfo.title}</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {emergencyInfo.items.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <item.icon className="text-red-500 dark:text-red-400 flex-shrink-0 mt-1" size={20} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-2">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mb-3">{item.description}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={item.onClick}
                      disabled={index === 0 && isLocationLoading}
                    >
                      {index === 0 && isLocationLoading ? 'Finding Location...' : item.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Doctor Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
                    <Shield className="text-blue-500" size={24} />
                    <span>Contact Medical Professionals</span>
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowContactModal(false)}>
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {doctorContacts.map((contact, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{contact.name}</h4>
                        <Badge variant="secondary" className="text-xs">{contact.type}</Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{contact.description}</p>
                      <div className="flex space-x-2">
                        {contact.phone !== 'Via MySejahtera App' ? (
                          <Button size="sm" onClick={() => callNumber(contact.phone)} className="flex items-center space-x-1">
                            <Phone size={14} />
                            <span>Call {contact.phone}</span>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            Open MySejahtera App
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Important:</strong> For PEP (Post-Exposure Prophylaxis), time is critical. 
                    Contact a doctor within 72 hours of potential exposure for maximum effectiveness.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Seek Help Modal */}
        {showSupportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
                    <Heart className="text-pink-500" size={24} />
                    <span>Emotional Support & Counseling</span>
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowSupportModal(false)}>
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {supportContacts.map((contact, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{contact.name}</h4>
                        <Badge variant="secondary" className="text-xs">{contact.type}</Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{contact.description}</p>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => callNumber(contact.phone)} className="flex items-center space-x-1">
                          <Phone size={14} />
                          <span>Call {contact.phone}</span>
                        </Button>
                        {contact.whatsapp && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openWhatsApp(contact.whatsapp!, 'Hello, I need some support and guidance.')}
                            className="flex items-center space-x-1"
                          >
                            <span>💬</span>
                            <span>WhatsApp</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Remember:</strong> You&apos;re not alone. These services are confidential and 
                    staffed by trained professionals who understand what you&apos;re going through.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Resource Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {resources.map((resource, index) => (
            <Card key={index} className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${resource.color}-100 dark:bg-${resource.color}-900`}>
                  <resource.icon className={`text-${resource.color}-600 dark:text-${resource.color}-400`} size={24} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {resource.type}
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{resource.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{resource.description}</p>
              
              <div className="space-y-2 mb-6">
                {resource.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-2 text-sm">
                    <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
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
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-center space-x-2">
              <Clock className="text-blue-500 dark:text-blue-400" size={20} />
              <span>Clinic Operating Hours</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Government Health Clinics</h4>
                <p className="text-gray-600 dark:text-gray-300">Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p className="text-gray-600 dark:text-gray-300">Saturday: 8:00 AM - 1:00 PM</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Government Hospitals</h4>
                <p className="text-gray-600 dark:text-gray-300">24 Hours (Emergency)</p>
                <p className="text-gray-600 dark:text-gray-300">Clinics: 8:00 AM - 5:00 PM</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Private Clinics</h4>
                <p className="text-gray-600 dark:text-gray-300">According to clinic schedule</p>
                <p className="text-gray-600 dark:text-gray-300">Usually 9:00 AM - 9:00 PM</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Reminder */}
        <div className="text-center mt-8">
          <Card className="p-4 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 inline-block">
            <div className="flex items-center space-x-2 text-sm text-green-800 dark:text-green-200">
              <Shield size={16} />
              <span>Reminder: All medical information is confidential and protected</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}