import SubmissionsTable from "./PendingApprovals";
import ResourceManagement from "./ResourceManagement";

const ProfessorHome = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <SubmissionsTable />
      </div>

      <div className="space-y-6">
        <ResourceManagement />
      </div>
    </div>
  );
};

export default ProfessorHome;
