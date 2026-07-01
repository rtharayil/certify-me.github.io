import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Award, 
  Settings2, 
  Palette, 
  Share2,
  CheckCircle2,
  ChevronRight,
  Menu,
  ShieldCheck,
  Star,
  Globe2,
  Building2,
  Briefcase,
  GraduationCap,
  Landmark,
  Linkedin,
  Twitter,
  Youtube
} from "lucide-react";
import "./_group.css";

export function Homepage() {
  return (
    <div className="homepage-wrapper min-h-screen w-full flex flex-col">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary-indigo" />
            <span className="font-bold text-xl tracking-tight text-slate-900">CertifyMe</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-primary-indigo transition-colors">Platform</a>
            <a href="#" className="hover:text-primary-indigo transition-colors">Solutions</a>
            <a href="#" className="hover:text-primary-indigo transition-colors">Integrations</a>
            <a href="#" className="hover:text-primary-indigo transition-colors">Pricing</a>
            <a href="#" className="hover:text-primary-indigo transition-colors">Resources</a>
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="font-medium">Start Free</Button>
            <Button className="bg-primary-indigo hover:bg-[#1a1c4b] text-white rounded-full px-6">
              Request Demo
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO */}
        <section className="relative overflow-hidden bg-slate-50 pt-20 pb-24">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(40,43,117,0.05)_0%,rgba(255,255,255,0)_100%)]" />
          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-primary-indigo text-sm font-semibold mb-6">
                  <Globe2 className="h-4 w-4" />
                  Global Certificate & Badge Management
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                  Issue, Manage & Verify <span className="text-gradient-indigo">Digital Credentials</span> at Scale
                </h1>
                
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Trusted by 4,800+ institutions across 144 countries. Automate certificate and badge issuance, track engagement, and let recipients share their achievements worldwide.
                </p>
                
                <div className="flex flex-wrap gap-4 mb-10">
                  <Button size="lg" className="bg-primary-indigo hover:bg-[#1a1c4b] text-white rounded-full px-8 h-14 text-base">
                    Request a Demo
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-semibold border-slate-300 hover:bg-slate-100">
                    Start Free Trial <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    Ranked #2 on G2
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    W3C Verifiable Credentials
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    Fraud-Proof Verification
                  </div>
                </div>
              </div>
              
              <div className="relative lg:h-[600px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-white rounded-[3rem] transform rotate-3 scale-105 opacity-50"></div>
                <img 
                  src="/__mockup/images/hero-credential.png" 
                  alt="Digital Credential Verification" 
                  className="relative z-10 w-full max-w-lg rounded-2xl shadow-2xl animate-float object-cover aspect-video"
                />
              </div>
            </div>
            
            {/* Client logos */}
            <div className="mt-20 pt-10 border-t border-slate-200">
              <p className="text-center text-sm font-semibold text-slate-400 mb-8 uppercase tracking-wider">Trusted by industry leaders worldwide</p>
              <div className="flex flex-wrap justify-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="text-xl font-bold font-serif">University of Europe</div>
                <div className="text-xl font-bold font-sans tracking-widest">IEEE</div>
                <div className="text-xl font-bold font-serif italic">HARVARD</div>
                <div className="text-xl font-bold font-sans">PMI</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. STATS BAR */}
        <section className="bg-primary-indigo text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-indigo-600/50">
              <div className="text-center px-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">4,800+</div>
                <div className="text-indigo-200 font-medium">Institutions</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">1M+</div>
                <div className="text-indigo-200 font-medium">Users</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">144</div>
                <div className="text-indigo-200 font-medium">Countries</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">87K+</div>
                <div className="text-indigo-200 font-medium">Monthly Credentials</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. PLATFORM FEATURES */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Enterprise-Grade Credential Infrastructure</h2>
              <p className="text-lg text-slate-600">Everything you need to build, scale, and secure your digital credentialing program in one unified platform.</p>
            </div>
            
            <Tabs defaultValue="analytics" className="w-full max-w-5xl mx-auto">
              <TabsList className="w-full h-auto flex flex-wrap justify-center bg-transparent gap-2 mb-12">
                <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-primary-indigo data-[state=active]:shadow-none rounded-full px-6 py-3 text-base">
                  <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="issuance" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-primary-indigo data-[state=active]:shadow-none rounded-full px-6 py-3 text-base">
                  <Award className="mr-2 h-4 w-4" /> Issuance
                </TabsTrigger>
                <TabsTrigger value="api" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-primary-indigo data-[state=active]:shadow-none rounded-full px-6 py-3 text-base">
                  <Settings2 className="mr-2 h-4 w-4" /> API & Integrations
                </TabsTrigger>
                <TabsTrigger value="branding" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-primary-indigo data-[state=active]:shadow-none rounded-full px-6 py-3 text-base">
                  <Palette className="mr-2 h-4 w-4" /> Branding
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-primary-indigo data-[state=active]:shadow-none rounded-full px-6 py-3 text-base">
                  <Share2 className="mr-2 h-4 w-4" /> Social
                </TabsTrigger>
              </TabsList>
              
              <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
                <TabsContent value="analytics" className="mt-0 outline-none">
                  <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Credential Analytics</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        Measure engagement, social sharing, and verification activity in real-time. Understand how your credentials are driving brand awareness and track the ROI of your programs.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="h-5 w-5 text-primary-indigo" /> Share rate tracking</li>
                        <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="h-5 w-5 text-primary-indigo" /> View & verification metrics</li>
                        <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="h-5 w-5 text-primary-indigo" /> Exportable custom reports</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 aspect-video flex items-center justify-center p-6">
                      <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                        <BarChart3 className="h-12 w-12 mb-2" />
                        <span>Analytics Dashboard Preview</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="issuance" className="mt-0 outline-none">
                  <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Automated Issuance</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        Scale your credentialing with bulk CSV uploads or API triggers. Achieve zero manual work while issuing thousands of tamper-proof certificates instantly.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="h-5 w-5 text-primary-indigo" /> Bulk CSV processing</li>
                        <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="h-5 w-5 text-primary-indigo" /> Dynamic data mapping</li>
                        <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="h-5 w-5 text-primary-indigo" /> Automated email delivery</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 aspect-video flex items-center justify-center p-6">
                      <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                        <Award className="h-12 w-12 mb-2" />
                        <span>Issuance Engine Preview</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="api" className="mt-0 outline-none">
                  <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">API & Integrations</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        Connect your LMS, CRM, or HRMS in minutes. Our robust REST API and pre-built connectors make it simple to embed credentialing into your existing workflows.
                      </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 aspect-video flex items-center justify-center p-6">
                      <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                        <Settings2 className="h-12 w-12 mb-2" />
                        <span>API Documentation Preview</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="mt-0 outline-none">
                  <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">White-Label Branding</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        Fully branded credential wallets and directories. Ensure every certificate, email, and landing page reflects your organization's unique identity.
                      </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 aspect-video flex items-center justify-center p-6">
                      <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                        <Palette className="h-12 w-12 mb-2" />
                        <span>Brand Customizer Preview</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="mt-0 outline-none">
                  <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Social Sharing</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        Turn every credential into a branded referral channel. One-click sharing to LinkedIn, Twitter, and Facebook amplifies your program's reach organically.
                      </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 aspect-video flex items-center justify-center p-6">
                      <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                        <Share2 className="h-12 w-12 mb-2" />
                        <span>Social Sharing Preview</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </section>

        {/* 5. SOCIAL PROOF / G2 */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Trusted by the World's Leading Institutions</h2>
              
              <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
                <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#ff492c] rounded flex items-center justify-center text-white font-bold text-xs">G2</div>
                  <span className="font-bold text-slate-700">Leader 2026</span>
                </div>
                <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200 flex items-center gap-3">
                  <div className="flex text-amber-400">
                    <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                  </div>
                  <span className="font-bold text-slate-700">4.8/5 Capterra</span>
                </div>
                <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200 flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                  <span className="font-bold text-slate-700">TrustRadius Top Rated</span>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="flex gap-1 text-amber-400 mb-6">
                    <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" />
                  </div>
                  <p className="text-slate-700 text-lg mb-8 leading-relaxed">
                    "CertifyMe transformed our certificate program — issuance time dropped by 90%. The analytics give us incredible insight into our members."
                  </p>
                  <div>
                    <div className="font-bold text-slate-900">Head of L&D</div>
                    <div className="text-slate-500 text-sm">PMI Phoenix Chapter</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="flex gap-1 text-amber-400 mb-6">
                    <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" />
                  </div>
                  <p className="text-slate-700 text-lg mb-8 leading-relaxed">
                    "Our students love the shareable badges. Verification is instant and fraud-proof, saving our office countless hours of manual checks."
                  </p>
                  <div>
                    <div className="font-bold text-slate-900">Registrar</div>
                    <div className="text-slate-500 text-sm">University of Europe</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="flex gap-1 text-amber-400 mb-6">
                    <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" />
                  </div>
                  <p className="text-slate-700 text-lg mb-8 leading-relaxed">
                    "The API integration with our LMS took less than a day. Phenomenal support team and a rock-solid infrastructure."
                  </p>
                  <div>
                    <div className="font-bold text-slate-900">CTO</div>
                    <div className="text-slate-500 text-sm">Global EdTech Platform</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 6. USE CASES */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Built for Every Credentialing Use Case</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group p-6 rounded-2xl border border-slate-200 hover:border-primary-indigo hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-primary-indigo flex items-center justify-center mb-6 group-hover:bg-primary-indigo group-hover:text-white transition-colors">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Higher Education</h3>
                <p className="text-slate-600">Digital diplomas, comprehensive learner records, and verifiable transcripts.</p>
              </div>

              <div className="group p-6 rounded-2xl border border-slate-200 hover:border-primary-indigo hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-primary-indigo flex items-center justify-center mb-6 group-hover:bg-primary-indigo group-hover:text-white transition-colors">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Corporate Training</h3>
                <p className="text-slate-600">Employee upskilling badges, compliance certificates, and internal academies.</p>
              </div>

              <div className="group p-6 rounded-2xl border border-slate-200 hover:border-primary-indigo hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-primary-indigo flex items-center justify-center mb-6 group-hover:bg-primary-indigo group-hover:text-white transition-colors">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Professional Associations</h3>
                <p className="text-slate-600">Membership credentials, continuing education units (CEUs), and renewals.</p>
              </div>

              <div className="group p-6 rounded-2xl border border-slate-200 hover:border-primary-indigo hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-primary-indigo flex items-center justify-center mb-6 group-hover:bg-primary-indigo group-hover:text-white transition-colors">
                  <Settings2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bootcamps & EdTech</h3>
                <p className="text-slate-600">Micro-credentials, skill-based badges, and automated graduation certificates.</p>
              </div>

              <div className="group p-6 rounded-2xl border border-slate-200 hover:border-primary-indigo hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-primary-indigo flex items-center justify-center mb-6 group-hover:bg-primary-indigo group-hover:text-white transition-colors">
                  <Landmark className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Government Bodies</h3>
                <p className="text-slate-600">Licenses, permits, regulatory compliance, and verifiable citizen records.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. INTEGRATIONS STRIP */}
        <section className="py-20 bg-slate-50 border-y border-slate-200 overflow-hidden">
          <div className="container mx-auto px-4 mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Connects With Your Entire Stack</h2>
          </div>
          
          <div className="relative flex w-full">
            <div className="flex animate-scroll gap-8 pr-8 whitespace-nowrap min-w-max">
              {/* Duplicate set for infinite scroll */}
              {[1, 2].map((set) => (
                <React.Fragment key={set}>
                  {['Salesforce', 'Workday', 'SAP', 'Moodle', 'Canvas LMS', 'Zapier', 'Slack', 'Microsoft Teams'].map((app) => (
                    <div key={app} className="flex items-center justify-center px-8 py-4 bg-white rounded-xl shadow-sm border border-slate-100 min-w-[200px]">
                      <span className="font-semibold text-slate-600">{app}</span>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CTA SECTION */}
        <section className="relative py-24 bg-primary-indigo overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/40 via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Modernize Your Credentialing Program?</h2>
            <p className="text-xl text-indigo-100 mb-10">Join 4,800+ institutions already using CertifyMe to issue secure, verifiable credentials.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-primary-indigo hover:bg-slate-100 rounded-full px-8 h-14 text-base font-bold">
                Request a Demo
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-semibold border-indigo-400 text-white hover:bg-indigo-700/50 hover:text-white bg-transparent">
                Talk to Sales
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-8 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Award className="h-6 w-6 text-indigo-400" />
                <span className="font-bold text-xl tracking-tight text-white">CertifyMe</span>
              </div>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-xs">
                Global SaaS Certificate & Badge Platform. Empowering organizations to issue verifiable digital credentials.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Solutions</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Higher Education</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Corporate Training</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Associations</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Government</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div>© 2026 CertifyMe. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
