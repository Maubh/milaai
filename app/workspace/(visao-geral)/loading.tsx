import WorkspaceSkeleton from "@/components/WorkspaceSkeleton";
import OverviewView from "./OverviewView";

/** Espera do servidor: a mesma visão geral, com a sessão ainda sem leitura. */
export default function OverviewLoading() {
  return (
    <WorkspaceSkeleton label="Carregando a visão geral…">
      <OverviewView session={{ status: "loading" }} waLink={null} />
    </WorkspaceSkeleton>
  );
}
