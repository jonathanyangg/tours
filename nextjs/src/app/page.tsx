export default function Home() {
  return (
    <div className="flex-1 bg-base-200 flex flex-col">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Tour Guide Matcher</a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <div className="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <div className="bg-primary text-primary-content flex items-center justify-center h-full font-medium">U</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 flex-1">
        {/* Hero Section */}
        <div className="hero bg-base-100 rounded-box shadow-md mb-6">
          <div className="hero-content text-center py-10">
            <div className="max-w-md">
              <div className="avatar mb-5">
                <div className="w-24 mask mask-squircle bg-primary bg-opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary m-auto" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold">Tour Guide Matching</h1>
              <p className="py-4">Match prospective students with the perfect tour guides based on their interests, background, and preferences.</p>
            </div>
          </div>
        </div>

        {/* Database Puller Card */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title">Find Matches from Database</h2>
            <p className="text-sm text-base-content/70 mb-4">Connect to the visiting students database and find optimal tour guide matches.</p>
            
            <div className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Search Criteria</span>
                </label>
                <div className="input-group">
                  <input type="text" placeholder="Search by name, date, or ID..." className="input input-bordered flex-1" />
                  <button className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-base-200 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Recent Visitors</h3>
                  <span className="badge badge-primary">15 pending</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-zebra table-sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Visit Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>VS-1234</td>
                        <td>Jane Smith</td>
                        <td>May 15, 2023</td>
                        <td><button className="btn btn-xs btn-primary">Match</button></td>
                      </tr>
                      <tr>
                        <td>VS-1235</td>
                        <td>John Doe</td>
                        <td>May 16, 2023</td>
                        <td><button className="btn btn-xs btn-primary">Match</button></td>
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

        {/* Upload CSV Card */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title">Bulk Match with CSV Upload</h2>
            <p className="text-sm text-base-content/70 mb-4">Upload a CSV file containing student information to perform bulk matching.</p>
            
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-lg bg-base-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-4 text-center">Drag and drop your CSV file here or click to browse</p>
              <input type="file" accept=".csv" className="file-input file-input-bordered file-input-primary w-full max-w-xs" />
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm">
                <a href="#" className="link link-primary">Download template</a>
              </div>
              <button className="btn btn-primary">Upload & Match</button>
            </div>
          </div>
        </div>
        
        {/* Manual Matching Form */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title">Individual Student Matching</h2>
            <p className="text-sm text-base-content/70 mb-4">Enter student information manually to find the best tour guide match.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Student ID</span>
                </label>
                <input type="text" placeholder="Enter student ID" className="input input-bordered w-full" />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Grade Level</span>
                </label>
                <select className="select select-bordered w-full" defaultValue="">
                  <option value="" disabled>Select grade</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Residential Status</span>
                </label>
                <select className="select select-bordered w-full" defaultValue="">
                  <option value="" disabled>Select status</option>
                  <option>In-state</option>
                  <option>Out-of-state</option>
                  <option>International</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Academic Interest</span>
                </label>
                <select className="select select-bordered w-full" defaultValue="">
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
                  <span className="label-text">Extracurricular Interest</span>
                </label>
                <select className="select select-bordered w-full" defaultValue="">
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
                  <span className="label-text">Housing Preference</span>
                </label>
                <select className="select select-bordered w-full" defaultValue="">
                  <option value="" disabled>Select preference</option>
                  <option>On-campus</option>
                  <option>Off-campus</option>
                  <option>Undecided</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Generation</span>
                </label>
                <select className="select select-bordered w-full" defaultValue="">
                  <option value="" disabled>Select status</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Campus Visit Date</span>
                </label>
                <input type="datetime-local" className="input input-bordered w-full" />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="btn btn-primary">Find Match</button>
            </div>
          </div>
        </div>
        
        {/* Recent Matches Card */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Recent Matches</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Matched Guide</th>
                    <th>Match Score</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>S12345</td>
                    <td>Alex Johnson</td>
                    <td>94%</td>
                    <td><div className="badge badge-success">Confirmed</div></td>
                    <td><button className="btn btn-xs btn-outline">View Details</button></td>
                  </tr>
                  <tr>
                    <td>S23456</td>
                    <td>Jamie Smith</td>
                    <td>87%</td>
                    <td><div className="badge badge-warning">Pending</div></td>
                    <td><button className="btn btn-xs btn-outline">View Details</button></td>
                  </tr>
                  <tr>
                    <td>S34567</td>
                    <td>Taylor Lee</td>
                    <td>92%</td>
                    <td><div className="badge badge-error">Cancelled</div></td>
                    <td><button className="btn btn-xs btn-outline">View Details</button></td>
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
 