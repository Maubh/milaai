import Link from "next/link";

import {
  ATUALIZADO_EM,
  CONTATO_PRIVACIDADE,
  CONTROLADOR_CNPJ,
  CONTROLADOR_ENDERECO,
  CONTROLADOR_NOME,
  INSTAGRAM,
} from "@/lib/legal";

export const metadata = {
  title: "Exclusão de dados — mila.",
  description:
    "Como pedir a exclusão dos seus dados na mila., inclusive os da integração com a Meta.",
};

export default function ExclusaoDeDadosPage() {
  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login">← Voltar</Link>
      </p>
      <h1 className="auth-minimal-title">Exclusão de dados</h1>
      <p className="auth-minimal-lede">
        Última atualização: {ATUALIZADO_EM}.
      </p>
      <div className="legal-body">
        <p>
          A mila. é operada por <strong>{CONTROLADOR_NOME}</strong>, CNPJ{" "}
          {CONTROLADOR_CNPJ}, {CONTROLADOR_ENDERECO}. Você pode pedir a exclusão
          dos seus dados a qualquer momento, como garante a LGPD (Lei 13.709/2018,
          art. 18).
        </p>

        <h2>1. Remover a mila. da sua conta do Facebook/Instagram</h2>
        <p>Assim você revoga o acesso da mila. aos dados da Meta na hora:</p>
        <ol>
          <li>
            No Facebook, abra <strong>Configurações e privacidade → Configurações</strong>.
          </li>
          <li>
            Entre em <strong>Integrações comerciais</strong> (ou <strong>Apps e sites</strong>).
          </li>
          <li>
            Encontre <strong>Mila AI</strong> e clique em <strong>Remover</strong>.
          </li>
          <li>
            Confirme. Se quiser, marque a opção de excluir as publicações e
            atividades feitas pelo app.
          </li>
        </ol>
        <p>
          Também dá para remover pelo Meta Business Suite:{" "}
          <strong>Configurações → Integrações → Integrações comerciais</strong>.
        </p>
        <p>
          Quando o app é removido, a mila. deixa de acessar sua conta Meta. O
          token de acesso e os identificadores de portfólio e catálogo guardados
          por nós são apagados em até 30 dias.
        </p>

        <h2>2. Pedir a exclusão de todos os seus dados na mila.</h2>
        <p>
          Mande um e-mail para{" "}
          <a href={`mailto:${CONTATO_PRIVACIDADE}`}><strong>{CONTATO_PRIVACIDADE}</strong></a>{" "}
          com o assunto <strong>&quot;Exclusão de dados&quot;</strong> e informe:
        </p>
        <ul>
          <li>o nome da loja;</li>
          <li>o número de WhatsApp cadastrado na mila.;</li>
          <li>se a exclusão é total (conta inteira) ou só da integração com a Meta.</li>
        </ul>
        <p>
          Para proteger sua conta, podemos pedir uma confirmação pelo WhatsApp
          cadastrado. Confirmamos o recebimento e concluímos a exclusão em até{" "}
          <strong>15 dias</strong>. No fim, mandamos a confirmação junto com um
          código do pedido.
        </p>

        <h2>3. O que é excluído</h2>
        <ul>
          <li>
            Dados da integração Meta: token de acesso, IDs e nomes do portfólio e
            dos catálogos, e o status de sincronização.
          </li>
          <li>
            Dados da conta: cadastro, histórico de conversas, produtos cadastrados,
            notas fiscais processadas e credenciais de integração.
          </li>
        </ul>

        <h2>4. O que pode ser mantido</h2>
        <ul>
          <li>
            Dados que a lei nos obriga a guardar, como registros de cobrança e
            fiscais, pelo prazo legal (LGPD, art. 16).
          </li>
          <li>
            Os itens publicados no seu catálogo da Meta pertencem à sua conta Meta.
            A mila. pode removê-los se você pedir antes de desconectar. Depois de
            desconectar, a remoção é feita por você no Gerenciador de Comércio.
          </li>
        </ul>

        <h2>5. Dúvidas</h2>
        <p>
          <a href={`mailto:${CONTATO_PRIVACIDADE}`}>{CONTATO_PRIVACIDADE}</a>
          {" · "}
          Instagram {INSTAGRAM}
          {" · "}
          <Link href="/privacidade">Política de privacidade</Link>
        </p>
      </div>
    </div>
  );
}
