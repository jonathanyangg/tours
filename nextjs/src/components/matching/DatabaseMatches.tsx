export default function DatabaseMatches() {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 mb-8">
      <div className="p-6">
        <h2 className="text-xl font-light text-gray-200 mb-2">Find Matches from Database</h2>
        <p className="text-sm text-gray-400 mb-6">Connect to the visiting students database and find optimal tour guide matches.</p>
        
        <div className="flex flex-col gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300 font-light">Search Criteria</span>
            </label>
            <div className="flex gap-2">
              <input type="text" placeholder="Search by name, date, or ID..." className="input input-bordered flex-1 bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 placeholder:text-gray-400" />
              <button className="btn bg-gray-600 text-white hover:bg-gray-500 border-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-light text-gray-200">Recent Visitors</h3>
              <span className="badge bg-gray-600 text-white border-none">15 pending</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="text-gray-300 font-light">ID</th>
                    <th className="text-gray-300 font-light">Name</th>
                    <th className="text-gray-300 font-light">Visit Date</th>
                    <th className="text-gray-300 font-light">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-600">
                    <td className="text-gray-300">VS-1234</td>
                    <td className="text-gray-200">Jane Smith</td>
                    <td className="text-gray-300">May 15, 2025</td>
                    <td><button className="btn btn-sm bg-green-700 text-white hover:bg-green-800 border-none">Match</button></td>
                  </tr>
                  <tr className="hover:bg-gray-600">
                    <td className="text-gray-300">VS-1235</td>
                    <td className="text-gray-200">Henry Nolan</td>
                    <td className="text-gray-300">May 16, 2025</td>
                    <td><button className="btn btn-sm bg-green-700 text-white hover:bg-green-800 border-none">Match</button></td>
                  </tr>
                  <tr className="hover:bg-gray-600">
                    <td className="text-gray-300">VS-1236</td>
                    <td className="text-gray-200">John Doe</td>
                    <td className="text-gray-300">May 17, 2025</td>
                    <td><button className="btn btn-sm bg-green-700 text-white hover:bg-green-800 border-none">Match</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="btn bg-gray-600 text-white hover:bg-gray-500 border-none">Match All Pending</button>
          </div>
        </div>
      </div>
    </div>
  );
} 