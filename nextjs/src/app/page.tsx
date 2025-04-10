export default function Home() {
  return (
    <div className="flex-1 bg-neutral-50 flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="navbar bg-white border-b border-neutral-200">
        <div className="flex-1">
          <a className="text-xl font-light tracking-wide text-neutral-800">Tour Guide Matcher</a>
        </div>
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <div className="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="badge badge-xs badge-neutral indicator-item"></span>
              </div>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-neutral-200">
                <div className="text-neutral-600 flex items-center justify-center h-full font-light">U</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-8">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-lg bg-neutral-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-light tracking-wide text-neutral-800 mb-4">Tour Guide Matching</h1>
              <p className="text-neutral-600 font-light">Match prospective students with the perfect tour guides based on their interests, background, and preferences.</p>
            </div>
          </div>
        </div>

        {/* Database Puller Card */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-light text-neutral-800 mb-2">Find Matches from Database</h2>
            <p className="text-sm text-neutral-500 mb-6">Connect to the visiting students database and find optimal tour guide matches.</p>
            
            <div className="flex flex-col gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-600 font-light">Search Criteria</span>
                </label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Search by name, date, or ID..." className="input input-bordered flex-1 bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-800 placeholder:text-neutral-500" />
                  <button className="btn bg-neutral-800 text-white hover:bg-neutral-700 border-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-light text-neutral-800">Recent Visitors</h3>
                  <span className="badge bg-neutral-800 text-white border-none">15 pending</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-neutral-100">
                        <th className="text-neutral-600 font-light">ID</th>
                        <th className="text-neutral-600 font-light">Name</th>
                        <th className="text-neutral-600 font-light">Visit Date</th>
                        <th className="text-neutral-600 font-light">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-neutral-50">
                        <td className="text-neutral-600">VS-1234</td>
                        <td className="text-neutral-800">Jane Smith</td>
                        <td className="text-neutral-600">May 15, 2023</td>
                        <td><button className="btn btn-sm bg-green-600 text-white hover:bg-green-700 border-none">Match</button></td>
                      </tr>
                      <tr className="hover:bg-neutral-50">
                        <td className="text-neutral-600">VS-1234</td>
                        <td className="text-neutral-800">Jane Smith</td>
                        <td className="text-neutral-600">May 15, 2023</td>
                        <td><button className="btn btn-sm bg-green-600 text-white hover:bg-green-700 border-none">Match</button></td>
                      </tr>
                      <tr className="hover:bg-neutral-50">
                        <td className="text-neutral-600">VS-1235</td>
                        <td className="text-neutral-800">John Doe</td>
                        <td className="text-neutral-600">May 16, 2023</td>
                        <td><button className="btn btn-sm bg-green-600 text-white hover:bg-green-700 border-none">Match</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="btn bg-black-600 text-white hover:bg-black-700 border-none">Match All Pending</button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload CSV Card */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-light text-neutral-800 mb-2">Bulk Match with CSV Upload</h2>
            <p className="text-sm text-neutral-500 mb-6">Upload a CSV file containing student information to perform bulk matching.</p>
            
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-4 text-center text-neutral-600 font-light">Drag and drop your CSV file here or click to browse</p>
              <input type="file" accept=".csv" className="file-input file-input-bordered w-full max-w-xs bg-white border-neutral-200 text-neutral-700" />
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm">
                <a href="#" className="text-neutral-600 hover:text-neutral-800 font-light">Download template</a>
              </div>
              <button className="btn bg-neutral-800 text-white hover:bg-neutral-700 border-none">Upload & Match</button>
            </div>
          </div>
        </div>
        
        {/* Manual Matching Form */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-light text-neutral-800 mb-2">Individual Student Matching</h2>
            <p className="text-sm text-neutral-500 mb-6">Enter student information manually to find the best tour guide match.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-600 font-light">Student ID</span>
                </label>
                <input type="text" placeholder="Enter student ID" className="input input-bordered bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-800 placeholder:text-neutral-500" />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-600 font-light">Grade Level</span>
                </label>
                <select className="select select-bordered bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-800" defaultValue="">
                  <option value="" disabled>Select grade</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-600 font-light">Residential Status</span>
                </label>
                <select className="select select-bordered bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-800" defaultValue="">
                  <option value="" disabled>Select status</option>
                  <option>In-state</option>
                  <option>Out-of-state</option>
                  <option>International</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-600 font-light">Academic Interest</span>
                </label>
                <select className="select select-bordered bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-800" defaultValue="">
                  <option value="" disabled>Select interest</option>
                  <option>Business</option>
                  <option>Engineering</option>
                  <option>Liberal Arts</option>
                  <option>Sciences</option>
                  <option>Fine Arts</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-600 font-light">Extracurricular Interest</span>
                </label>
                <select className="select select-bordered bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-800" defaultValue="">
                  <option value="" disabled>Select interest</option>
                  <option>Athletics</option>
                  <option>Student Government</option>
                  <option>Arts & Performance</option>
                  <option>Community Service</option>
                  <option>Research</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-600 font-light">Housing Preference</span>
                </label>
                <select className="select select-bordered bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-800" defaultValue="">
                  <option value="" disabled>Select preference</option>
                  <option>On-campus</option>
                  <option>Off-campus</option>
                  <option>Undecided</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-600 font-light">First Generation</span>
                </label>
                <select className="select select-bordered bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-800" defaultValue="">
                  <option value="" disabled>Select status</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral-600 font-light">Campus Visit Date</span>
                </label>
                <input type="datetime-local" className="input input-bordered bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-800" />
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button className="btn bg-neutral-800 text-white hover:bg-neutral-700 border-none">Find Match</button>
            </div>
          </div>
        </div>
        
        {/* Recent Matches Card */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6">
            <h2 className="text-xl font-light text-neutral-800 mb-6">Recent Matches</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="text-neutral-600 font-light">Student ID</th>
                    <th className="text-neutral-600 font-light">Matched Guide</th>
                    <th className="text-neutral-600 font-light">Match Score</th>
                    <th className="text-neutral-600 font-light">Status</th>
                    <th className="text-neutral-600 font-light">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-neutral-50">
                    <td className="text-neutral-600">S12345</td>
                    <td className="text-neutral-800">Alex Johnson</td>
                    <td className="text-neutral-600">94%</td>
                    <td><div className="badge bg-green-700 text-white border-none">Confirmed</div></td>
                    <td><button className="btn btn-sm btn-outline border-neutral-300 hover:bg-neutral-100 text-black">View Details</button></td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="text-neutral-600">S23456</td>
                    <td className="text-neutral-800">Jamie Smith</td>
                    <td className="text-neutral-600">87%</td>
                    <td><div className="badge bg-orange-600 text-white border-none">Pending</div></td>
                    <td><button className="btn btn-sm btn-outline border-neutral-300 hover:bg-neutral-100 text-black">View Details</button></td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="text-neutral-600">S34567</td>
                    <td className="text-neutral-800">Taylor Lee</td>
                    <td className="text-neutral-600">92%</td>
                    <td><div className="badge bg-red-700 text-white border-none">Cancelled</div></td>
                    <td><button className="btn btn-sm btn-outline border-neutral-300 hover:bg-neutral-100 text-black">View Details</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
