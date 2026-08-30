const fs = require('fs');
let content = fs.readFileSync('src/pages/DriverDashboard.tsx', 'utf8');

// 1. Remove ModeAPanel import and add DriverAnalyticsHome
content = content.replace(
  "import ModeAPanel from '../components/dashboard/ModeAPanel';",
  "import DriverAnalyticsHome from '../components/dashboard/DriverAnalyticsHome';"
);

// 2. Extract out the Main Map Area replacement
const newMainContent = `      {/* Main Content Area */}
      <div className="flex-1 relative bg-transparent overflow-hidden">
        {!activeTrip ? (
           <>
              <DriverAnalyticsHome 
                onStartTrip={toggleDuty} 
                onOpenNotifications={() => setShowNotifications(true)}
              />
              
              {isOnDuty && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                     <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin" />
                     <span className="font-bold text-slate-800 dark:text-slate-100">Checking for dispatch...</span>
                  </div>
                </div>
              )}
           </>
        ) : (
           <>
              <GISMap />
              <MapLayers />
              <MapLegend />

              {activeTrip.status === 'assigned' || activeTrip.status === 'accepted' ? (
                <RoutePanel />
              ) : activeTrip.status === 'completed' || activeTrip.status === 'cancelled' ? (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 z-20 border border-white/20 dark:border-slate-700/50 w-[90%] max-w-sm text-center">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {activeTrip.status === 'completed' ? 'Trip Completed! 🎉' : 'Trip Cancelled'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">You are still on duty. What would you like to do next?</p>
                  <div className="flex w-full gap-3 mt-2">
                    <button 
                      onClick={() => { useAppStore.getState().setActiveTrip(null); fetchAssignedTrip(); }}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                      Find Next
                    </button>
                    <button 
                      onClick={toggleDuty}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                    >
                      Off Duty
                    </button>
                  </div>
                </div>
              ) : (
                <ActiveTripPanel />
              )}
           </>
        )}
                
        <StartTripModal />
        {showIncidentReport && <ReportIncidentModal onClose={() => setShowIncidentReport(false)} />}
        {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      </div>
    </div>
  );
}`;

content = content.replace(
  /\{\/\* Main Map Area \*\/\}.*\}\s*<\/div>\s*<\/div>\s*\);\s*\}/s,
  newMainContent
);

fs.writeFileSync('src/pages/DriverDashboard.tsx', content);
console.log('DriverDashboard patched');
