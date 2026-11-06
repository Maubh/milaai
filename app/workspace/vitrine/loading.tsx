import WorkspaceSkeleton from "@/components/WorkspaceSkeleton";
import VitrineLayoutView from "./VitrineLayoutView";

export default function WorkspaceVitrineLoading() {
  return (
    <WorkspaceSkeleton label="Carregando a vitrine…">
      <VitrineLayoutView pending />
    </WorkspaceSkeleton>
  );
}
