import Header from "@/components/header";
import UploadZone from "@/components/upload-zone";
import FileList from "@/components/file-list";
import StatsOverview from "@/components/stats-overview";

export default function Dashboard() {
  return (
    <div className="font-inter bg-gray-50 min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Share files securely</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your files and get a secure link to share with anyone. Set expiry dates and
            passwords for extra security.
          </p>
        </div>

        <UploadZone />
        <FileList />
        <StatsOverview />
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

          <div className="border-t border-gray-200 pt-8 mt-8 text-center text-gray-600">
            <p>&copy; 2024 FileGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
