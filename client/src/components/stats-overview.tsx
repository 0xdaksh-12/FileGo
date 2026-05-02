import { Card, CardContent } from "@/components/ui/card";
import { useStats } from "@/hooks/use-queries";

export default function StatsOverview() {
  const { data: stats, isLoading } = useStats();

  if (isLoading && !stats) {
    return (
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Usage Statistics
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Usage Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px]">upload</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {stats.totalUploads}
            </h4>
            <p className="text-sm text-gray-600">Total Uploads</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[24px]">download</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {stats.totalDownloads}
            </h4>
            <p className="text-sm text-gray-600">Total Downloads</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-[24px]">storage</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {stats.storageUsed}
            </h4>
            <p className="text-sm text-gray-600">Storage Used</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600 text-[24px]">schedule</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {stats.activeFiles}
            </h4>
            <p className="text-sm text-gray-600">Active Files</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
