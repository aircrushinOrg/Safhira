'use client'

import {Link} from '../../i18n/routing'
import { useState } from 'react'
import { 
  Shield, MapPin, Heart, ExternalLink, Phone, Users, Landmark,
  GraduationCap, CheckCircle2 as CheckCircle, Search, Lock, AlertCircle
} from 'lucide-react'

import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/app/components/ui/card'
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '@/app/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert'

export default function SexualHealthRightsPage() {
  const [isLocating, setIsLocating] = useState(false)

  const openMapsSearch = (query: string) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank')
  }

  const findNearby = async (query: string) => {
    try {
      setIsLocating(true)
      if (!navigator.geolocation) {
        openMapsSearch(query)
        return
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      })

      const { latitude, longitude } = position.coords
      const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`
      window.open(url, '_blank')
    } catch {
      openMapsSearch(query)
    } finally {
      setIsLocating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-10 md:py-14 px-4">
        <div className="container mx-auto max-w-6xl">
          <header className="mb-8 md:mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Your Rights to Sexual Health in Malaysia
                </h1>
                <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                  Clear, judgment-free guidance to help you access care, understand available support, and make informed decisions about your well‑being.
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/90 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                  <Shield size={18} />
                  <CardTitle className="text-lg md:text-xl">What you can expect</CardTitle>
                </div>
                <CardDescription>
                  Everyone deserves respectful, confidential sexual healthcare.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2"><CheckCircle className="text-teal-600 dark:text-teal-400 mt-0.5" size={16}/> Confidential consultations and testing</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-teal-600 dark:text-teal-400 mt-0.5" size={16}/> Non‑judgmental, professional care</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-teal-600 dark:text-teal-400 mt-0.5" size={16}/> Information to make informed choices</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-teal-600 dark:text-teal-400 mt-0.5" size={16}/> Referrals to support services when needed</li>
                </ul>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Lock size={14}/> Your privacy matters — ask about confidentiality if unsure.
                </div>
              </CardFooter>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <MapPin size={18} />
                  <CardTitle className="text-lg md:text-xl">Need testing or screening?</CardTitle>
                </div>
                <CardDescription>
                  Find clinics that provide STI screening and counseling.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Button onClick={() => findNearby('STI screening clinic near me')}>{isLocating ? 'Locating…' : 'Find nearby clinics'}</Button>
                  <Button variant="outline" onClick={() => openMapsSearch('Klinik Kesihatan STI screening')}>
                    Government clinics
                  </Button>
                </div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle className="text-blue-600 mt-0.5" size={16}/> Government health clinics (Klinik Kesihatan)</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-blue-600 mt-0.5" size={16}/> Government hospitals (specialist clinics)</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-blue-600 mt-0.5" size={16}/> Private clinics and medical centres</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-blue-600 mt-0.5" size={16}/> NGO‑run community health centres</li>
                </ul>
              </CardContent>
              <CardFooter className="gap-2">
                <Link href="/stis">
                  <Button variant="ghost" size="sm" className="text-blue-700 dark:text-blue-300 flex items-center">
                    Learn about STIs <ExternalLink size={14} className="ml-2"/>
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                  <Heart size={18} />
                  <CardTitle className="text-lg md:text-xl">Free protection options</CardTitle>
                </div>
                <CardDescription>
                  Practical ways to access condoms and safer‑sex resources.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => openMapsSearch('Klinik Kesihatan near me')}>
                    Find Klinik Kesihatan
                  </Button>
                  <Button variant="outline" onClick={() => openMapsSearch('NGO community health centre Malaysia')}>
                    Find NGO centres
                  </Button>
                </div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle className="text-rose-600 mt-0.5" size={16}/> Ask at registration counters in government clinics</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-rose-600 mt-0.5" size={16}/> Some NGOs and universities provide free condoms</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-rose-600 mt-0.5" size={16}/> Consider purchasing from pharmacies if urgent</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/stis/prevention">
                  <Button variant="ghost" size="sm" className="text-rose-700 dark:text-rose-300">Safer‑sex tips</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          

          <Card className="mb-8 bg-white/90 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="text-purple-600" size={18} />
                <CardTitle className="text-lg md:text-xl">Assistance schemes and where to get support</CardTitle>
              </div>
              <CardDescription>
                Explore common pathways to financial, emotional, and practical support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Landmark className="text-emerald-600" size={16} />
                      Government clinics (low‑cost services)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Government health clinics and hospitals provide affordable consultations, testing, and treatment. Fees are typically lower for Malaysian citizens.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => findNearby('Klinik Kesihatan near me')}>
                        Find nearby Klinik Kesihatan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openMapsSearch('Hospital specialist clinic sexual health Malaysia')}>
                        Hospital specialist clinics
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Users className="text-sky-600" size={16} />
                      NGOs & community organisations
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Non‑governmental organisations may offer counseling, screening, peer support, and referrals. Services are often low‑cost or free.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openMapsSearch('HIV STI NGO centre Malaysia')}>
                        Find nearby NGOs
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openMapsSearch('community health centre Malaysia')}>
                        Community health centres
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="text-indigo-600" size={16} />
                      University & student health services
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Many campuses provide health services, basic screening, and counseling. Check your student health centre for availability.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openMapsSearch('university health centre Malaysia')}>
                        Find campus clinics
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Search className="text-amber-600" size={16} />
                      Financial help & subsidies (general guidance)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Ask at clinic counters about eligibility for reduced‑fee services and referral pathways. You can also contact official hotlines for guidance.
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Button size="sm" variant="outline" onClick={() => openMapsSearch('Klinik Kesihatan fees Malaysia')}>
                        Learn about clinic fees
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open('tel:15999', '_self')}>
                        <Phone size={14} className="mr-1"/> Call Talian Kasih 15999
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <MapPin size={18}/> Quick clinic finder
                </CardTitle>
                <CardDescription>Open maps with helpful searches.</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-2">
                <Button onClick={() => findNearby('STI clinic near me')}>{isLocating ? 'Locating…' : 'STI clinics near me'}</Button>
                <Button variant="outline" onClick={() => openMapsSearch('sexual health clinic Malaysia')}>Sexual health clinics</Button>
                <Button variant="outline" onClick={() => openMapsSearch('HIV testing centre Malaysia')}>HIV testing centres</Button>
                <Button variant="outline" onClick={() => openMapsSearch('Klinik Kesihatan STI Malaysia')}>Klinik Kesihatan</Button>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-gray-600 dark:text-gray-400">Tip: Call ahead to confirm services and hours.</p>
              </CardFooter>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="text-red-600" size={18}/>
                  If you need urgent help
                </CardTitle>
                <CardDescription>Seek care promptly for severe symptoms.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => findNearby('hospital emergency near me')}>Nearest hospital</Button>
                  <Button variant="outline" onClick={() => window.open('tel:999', '_self')}>
                    <Phone size={14} className="mr-1"/> Call 999
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-gray-600 dark:text-gray-400">Go to emergency if you have severe pain, heavy bleeding, high fever, or feel unsafe.</p>
              </CardFooter>
            </Card>
          </div>

          <Alert className="mt-8">
            <AlertTitle className="flex items-center gap-2">
              <Shield size={16}/> Friendly privacy note
            </AlertTitle>
            <AlertDescription>
              This page provides general information to support access to care. It is not a substitute for professional or legal advice. If you have questions about your rights or options, speak with a healthcare provider or counselor.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </div>
  )
}
