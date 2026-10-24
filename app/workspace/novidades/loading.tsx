import WorkspaceSkeleton from "@/components/WorkspaceSkeleton";
import UpdatesView from "./UpdatesView";

export default function UpdatesLoading() {
  return (
    <WorkspaceSkeleton label="Carregando as atualizações…">
      <UpdatesView loading />
    </WorkspaceSkeleton>
  );
}
