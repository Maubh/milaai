import WorkspaceSkeleton from "@/components/WorkspaceSkeleton";
import PlanView from "./PlanView";

/** Espera do servidor: a mesma página do plano, com a sessão ainda sem leitura. */
export default function PlanLoading() {
  return (
    <WorkspaceSkeleton label="Carregando seu plano…">
      <PlanView session={null} loading failed={false} />
    </WorkspaceSkeleton>
  );
}
