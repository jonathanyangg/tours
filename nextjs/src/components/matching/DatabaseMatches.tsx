export default function DatabaseMatches() {
  return (
    <div className="card bg-base-200 shadow-md border border-base-300 mb-8">
      <div className="p-6">
        <h2 className="text-xl font-normal text-base-content mb-2">Find Matches from Database</h2>
        <p className="text-sm text-base-content/70 mb-6">Connect to the visiting students database and find optimal tour guide matches.</p>
        
        <div className="flex flex-col gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-base-content/80 font-normal">Search Criteria</span>
            </label>
            <div className="flex gap-2">
              <input type="text" placeholder="Search by name, date, or ID..." className="input input-bordered flex-1 bg-base-100 border-base-300 text-base-content placeholder:text-base-content/50" />
              <button className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="card bg-base-100 p-4 rounded-lg border border-base-300 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-normal text-base-content">Recent Visitors</h3>
              <span className="badge badge-primary">15 pending</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-base-content/70 font-normal">ID</th>
                    <th className="text-base-content/70 font-normal">Name</th>
                    <th className="text-base-content/70 font-normal">Visit Date</th>
                    <th className="text-base-content/70 font-normal">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-base-200">
                    <td className="text-base-content/70">VS-1234</td>
                    <td className="text-base-content">Jane Smith</td>
                    <td className="text-base-content/70">May 15, 2025</td>
                    <td><button className="btn btn-sm btn-success">Match</button></td>
                  </tr>
                  <tr className="hover:bg-base-200">
                    <td className="text-base-content/70">VS-1235</td>
                    <td className="text-base-content">Henry Nolan</td>
                    <td className="text-base-content/70">May 16, 2025</td>
                    <td><button className="btn btn-sm btn-success">Match</button></td>
                  </tr>
                  <tr className="hover:bg-base-200">
                    <td className="text-base-content/70">VS-1236</td>
                    <td className="text-base-content">John Doe</td>
                    <td className="text-base-content/70">May 17, 2025</td>
                    <td><button className="btn btn-sm btn-success">Match</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="btn btn-primary">Match All Pending</button>
          </div>
        </div>
      </div>
    </div>
  );
} 