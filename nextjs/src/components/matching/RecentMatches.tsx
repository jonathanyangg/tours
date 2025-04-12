export default function RecentMatches() {
  return (
    <div className="card bg-base-200 shadow-md border border-base-300">
      <div className="p-6">
        <h2 className="text-xl font-normal text-base-content mb-6">Recent Matches</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-300">
                <th className="text-base-content/70 font-normal">Student</th>
                <th className="text-base-content/70 font-normal">Tour Guide</th>
                <th className="text-base-content/70 font-normal">Match Date</th>
                <th className="text-base-content/70 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-base-300">
                <td className="text-base-content">Jane Smith</td>
                <td className="text-base-content">John Doe</td>
                <td className="text-base-content/70">May 15, 2023</td>
                <td><span className="badge badge-success">Confirmed</span></td>
              </tr>
              <tr className="hover:bg-base-300">
                <td className="text-base-content">Alice Johnson</td>
                <td className="text-base-content">Bob Wilson</td>
                <td className="text-base-content/70">May 14, 2023</td>
                <td><span className="badge badge-warning">Pending</span></td>
              </tr>
              <tr className="hover:bg-base-300">
                <td className="text-base-content">Sarah Brown</td>
                <td className="text-base-content">Mike Davis</td>
                <td className="text-base-content/70">May 13, 2023</td>
                <td><span className="badge badge-success">Confirmed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 