export default function IndividualMatch() {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 mb-8">
      <div className="p-6">
        <h2 className="text-xl font-light text-gray-200 mb-2">Individual Student Matching</h2>
        <p className="text-sm text-gray-400 mb-6">Enter student information manually to find the best tour guide match.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Student ID</span>
            </label>
            <input type="text" placeholder="Enter student ID" className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 placeholder:text-gray-400 w-full" />
          </div>
          
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Gender</span>
            </label>
            <select className="select select-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full" defaultValue="">
              <option value="" disabled>Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Application Grade</span>
            </label>
            <select className="select select-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full" defaultValue="">
              <option value="" disabled>Select grade</option>
              <option>Freshman</option>
              <option>Sophomore</option>
              <option>Junior</option>
              <option>Senior/PG</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Residential Status</span>
            </label>
            <select className="select select-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full" defaultValue="">
              <option value="" disabled>Select status</option>
              <option>Boarder</option>
              <option>Day Student</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Domestic or International</span>
            </label>
            <select className="select select-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full" defaultValue="">
              <option value="" disabled>Select status</option>
              <option>Domestic</option>
              <option>International</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Sports</span>
            </label>
            <input 
              type="text" 
              placeholder="Enter sports interests..." 
              className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
            />
          </div>
          
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Extracurricular Activities</span>
            </label>
            <input 
              type="text" 
              placeholder="Enter extracurricular activities..." 
              className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full max-w-full truncate"
              maxLength={50}
            />
          </div>
          
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Academic Interests</span>
            </label>
            <input 
              type="text" 
              placeholder="Enter academic interests..." 
              className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
            />
          </div>
          
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Other Notes</span>
            </label>
            <input 
              type="text" 
              placeholder="Enter any additional notes..." 
              className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full"
            />
          </div>
          
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300 font-light">Visiting Date and Time</span>
            </label>
            <input type="datetime-local" className="input input-bordered bg-gray-700 border-gray-600 focus:border-gray-500 text-gray-200 w-full" />
          </div>
        </div>
        
        <div className="flex justify-end mt-8">
          <button className="btn bg-gray-600 text-white hover:bg-gray-500 border-none">Find Match</button>
        </div>
      </div>
    </div>
  );
} 