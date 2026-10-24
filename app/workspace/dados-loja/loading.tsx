import WorkspaceSkeleton from "@/components/WorkspaceSkeleton";
import DadosLojaView from "./DadosLojaView";

/** Espera do servidor: a mesma página, com as seções reais e os valores ainda sem leitura. */
export default function DadosLojaLoading() {
  return (
    <WorkspaceSkeleton label="Carregando os dados da loja…">
      <DadosLojaView pending />
    </WorkspaceSkeleton>
  );
}
