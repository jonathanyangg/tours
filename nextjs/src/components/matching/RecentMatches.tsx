export default function RecentMatches() {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-light text-gray-200 mb-6">Recent Matches</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="text-gray-300 font-light">Student</th>
                <th className="text-gray-300 font-light">Tour Guide</th>
                <th className="text-gray-300 font-light">Match Date</th>
                <th className="text-gray-300 font-light">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-600">
                <td className="text-gray-200">Jane Smith</td>
                <td className="text-gray-200">John Doe</td>
                <td className="text-gray-300">May 15, 2023</td>
                <td><span className="badge bg-green-700 text-white border-none">Confirmed</span></td>
              </tr>
              <tr className="hover:bg-gray-600">
                <td className="text-gray-200">Alice Johnson</td>
                <td className="text-gray-200">Bob Wilson</td>
                <td className="text-gray-300">May 14, 2023</td>
                <td><span className="badge bg-yellow-700 text-white border-none">Pending</span></td>
              </tr>
              <tr className="hover:bg-gray-600">
                <td className="text-gray-200">Sarah Brown</td>
                <td className="text-gray-200">Mike Davis</td>
                <td className="text-gray-300">May 13, 2023</td>
                <td><span className="badge bg-green-700 text-white border-none">Confirmed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 