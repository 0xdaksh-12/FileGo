import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  return (
    <div className="font-inter bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px] sm:text-[22px]">
                  share
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">FileGo</h1>
            </div>

            <Button
              onClick={() => setLocation("/auth")}
              className="bg-primary text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
            Share files securely and easily
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Upload your files and get secure, shareable links with password protection and automatic
            expiry. Perfect for professionals who need reliable file sharing.
          </p>
          <Button
            onClick={() => setLocation("/auth")}
            size="lg"
            className="w-full sm:w-auto px-8 py-4 text-lg"
          >
            Get Started Free
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <Card>
            <CardContent className="p-[6px] sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="material-symbols-outlined text-primary text-[24px] sm:text-[32px]">
                  shield_lock
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                Secure by Default
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Password protection and automatic expiry ensure your files stay secure and don't
                live forever on the internet.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-[6px] sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="material-symbols-outlined text-green-600 text-[24px] sm:text-[32px]">
                  bolt
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                Lightning Fast
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Upload files up to 2GB quickly and get instant shareable links. No waiting around or
                complex setup required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-[6px] sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="material-symbols-outlined text-purple-600 text-[24px] sm:text-[32px]">
                  analytics
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                Track Everything
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor download counts, track usage statistics, and manage all your shared files
                from one dashboard.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Ready to start sharing?
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust FileGo for their secure file sharing needs.
              Sign up now and get started instantly.
            </p>
            <Button
              onClick={() => setLocation("/auth")}
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-lg"
            >
              Sign Up Now
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[20px]">share</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">FileGo</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Secure, fast, and reliable file sharing for everyone. Share files up to 2GB with
                password protection and expiry dates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 sm:pt-8 mt-6 sm:mt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2024 FileGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
