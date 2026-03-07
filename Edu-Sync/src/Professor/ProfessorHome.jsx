import SubmissionsTable from './PendingApprovals';
// import StatsCard from './StatsCard';
import ResourceManagement from './ResourceManagement';

const ProfessorHome = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Submissions Table */}
      <div className="lg:col-span-2 space-y-6">
        <SubmissionsTable />
      </div>

      {/* Right Column: Widgets */}
      <div className="space-y-6">
        <ResourceManagement/>
        {/* <StatsCard /> */}
      </div>
    </div>
  );
};

export default ProfessorHome;