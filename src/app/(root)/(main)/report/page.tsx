import { getRecentReports } from "@/utils/db/actions/report.actions";
import { MapPin } from "lucide-react";
import { FC } from "react";
import { ReportWaste } from "./_components/report-waste";

interface PageProps {}

const Page: FC<PageProps> = async ({}) => {
  const recentReports = (await getRecentReports()) || [];
  const reports = recentReports.map((report) => ({
    ...report,
    createdAt: report.createdAt.toISOString().split("T")[0],
  }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Report waste</h1>
      <ReportWaste />
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Recent Reports</h2>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <MapPin className="inline-block w-4 h-4 mr-2 text-green-500" />
                      {report.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.wasteType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.createdAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
